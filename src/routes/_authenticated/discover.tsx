import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";
import {
    creators,
    defaultState,
    FanlyState,
    getAllPosts,
    readFanlyState,
    toggleCreatorFollow,
    toggleCreatorSubscription,
} from "../../lib/fanly-data";

export const Route = createFileRoute("/_authenticated/discover")({
    head: () => ({ meta: [{ title: "Discover - Naked Profile" }] }),
    component: DiscoverPage,
});

function DiscoverPage() {
    const [query, setQuery] = useState("");
    const [state, setState] = useState<FanlyState>(defaultState);
    const [posts, setPosts] = useState<Awaited<ReturnType<typeof getAllPosts>>>(
        [],
    );
    const normalized = query.trim().toLowerCase();

    useEffect(() => {
        void refresh();
    }, []);

    async function refresh() {
        const [nextPosts, nextState] = await Promise.all([
            getAllPosts(),
            readFanlyState(),
        ]);
        setPosts(nextPosts);
        setState(nextState);
    }

    const filteredCreators = useMemo(
        () =>
            creators.filter(
                (creator) =>
                    !normalized ||
                    creator.name.toLowerCase().includes(normalized) ||
                    creator.handle.toLowerCase().includes(normalized) ||
                    creator.category.toLowerCase().includes(normalized),
            ),
        [normalized],
    );

    const filteredPosts = useMemo(
        () =>
            posts.filter(
                (post) =>
                    !normalized ||
                    post.caption.toLowerCase().includes(normalized) ||
                    post.authorName.toLowerCase().includes(normalized),
            ),
        [normalized, posts],
    );

    return (
        <AccountPageShell
            eyebrow="Explore"
            title="Discover"
            description="Find creators, posts, tags, and media across Naked Profile."
        >
            <AccountCard>
                <label className="relative block h-11">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search creators, posts, tags..."
                        className="h-full w-full rounded-full border border-border bg-background/60 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                </label>
            </AccountCard>

            <AccountCard>
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Creators
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCreators.map((creator) => {
                        const followed = state.followedCreatorIds.includes(
                            creator.id,
                        );
                        const subscribed = state.subscribedCreatorIds.includes(
                            creator.id,
                        );

                        return (
                            <div
                                key={creator.id}
                                className="overflow-hidden rounded-lg border border-border bg-background/60"
                            >
                                <img
                                    src={creator.avatar}
                                    alt=""
                                    className="aspect-square w-full object-cover"
                                />
                                <div className="p-3">
                                    <div className="text-sm font-semibold">
                                        {creator.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        @{creator.handle} · {creator.category}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={async () => {
                                                await toggleCreatorFollow(
                                                    creator.id,
                                                    followed,
                                                );
                                                await refresh();
                                            }}
                                            className="flex-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                                        >
                                            {followed ? "Following" : "Follow"}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await toggleCreatorSubscription(
                                                    creator.id,
                                                    subscribed,
                                                );
                                                await refresh();
                                            }}
                                            className="flex-1 rounded-full bg-success px-3 py-2 text-xs font-semibold text-success-foreground"
                                        >
                                            {subscribed
                                                ? "Subscribed"
                                                : creator.price}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AccountCard>

            <AccountCard>
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Compass className="h-4 w-4 text-primary" />
                    Trending posts
                </div>
                <div className="space-y-3">
                    {filteredPosts.slice(0, 5).map((post) => (
                        <Link
                            key={post.id}
                            to="/dashboard"
                            className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 hover:bg-background"
                        >
                            {post.mediaUrl && (
                                <img
                                    src={post.mediaUrl}
                                    alt=""
                                    className="h-14 w-14 rounded-md object-cover"
                                />
                            )}
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                    {post.authorName}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {post.caption}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
