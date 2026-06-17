import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Heart, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    AccountCard,
    AccountPageShell,
    EmptyState,
} from "../../components/account-page-shell";
import {
    defaultState,
    FanlyState,
    FeedPost,
    formatTimeAgo,
    getAllPosts,
    readFanlyState,
    togglePostBookmark,
} from "../../lib/fanly-data";

export const Route = createFileRoute("/_authenticated/bookmarks")({
    head: () => ({ meta: [{ title: "Bookmarks - Naked Profile" }] }),
    component: BookmarksPage,
});

function BookmarksPage() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [state, setState] = useState<FanlyState>(defaultState);

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

    const bookmarked = useMemo(
        () => posts.filter((post) => state.bookmarkedPostIds.includes(post.id)),
        [posts, state.bookmarkedPostIds],
    );

    async function removeBookmark(postId: string) {
        await togglePostBookmark(postId, true);
        await refresh();
    }

    return (
        <AccountPageShell
            title="Bookmarks"
            description="Return to saved posts, creators, and media."
        >
            <AccountCard>
                {bookmarked.length ? (
                    <div className="space-y-3">
                        {bookmarked.map((post) => (
                            <SavedPost
                                key={post.id}
                                post={post}
                                onRemove={() => removeBookmark(post.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Bookmark className="h-9 w-9" />}
                        text="No bookmarked posts yet."
                    />
                )}
            </AccountCard>
        </AccountPageShell>
    );
}

function SavedPost({
    onRemove,
    post,
}: {
    onRemove: () => void;
    post: FeedPost;
}) {
    return (
        <article className="flex gap-3 rounded-lg border border-border bg-background/60 p-3">
            {post.mediaUrl ? (
                <img
                    src={post.mediaUrl}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover"
                />
            ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-card text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{post.authorName}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {post.caption || "Media post"}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>@{post.authorHandle}</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {post.likes}
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-end justify-between">
                <Link
                    to="/dashboard"
                    className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                    Open
                </Link>
                <button
                    onClick={onRemove}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    Remove
                </button>
            </div>
        </article>
    );
}
