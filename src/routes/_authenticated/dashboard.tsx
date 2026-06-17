import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bookmark,
    ChevronUp,
    Eye,
    EyeOff,
    Heart,
    Image as ImageIcon,
    ListFilter,
    Loader2,
    Lock,
    MessageCircle,
    MoreHorizontal,
    Search,
    Send,
    Tags,
    Upload,
    Video,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { AppTopBar } from "../../components/app-top-bar";
import { supabase } from "../../integrations/supabase/client";
import {
    creators,
    createFanlyPost,
    defaultState,
    FanlyState,
    FeedPost,
    formatTimeAgo,
    getAllPosts,
    readFanlyState,
    toggleCreatorFollow,
    toggleCreatorSubscription,
    togglePostBookmark,
    togglePostLike,
} from "../../lib/fanly-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
    head: () => ({ meta: [{ title: "Dashboard - Naked Profile" }] }),
    component: DashboardPage,
});

type FeedMode = "for-you" | "following" | "media";
type Profile = {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
};

function DashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [state, setState] = useState<FanlyState>(defaultState);
    const [mode, setMode] = useState<FeedMode>("for-you");
    const [query, setQuery] = useState("");

    useEffect(() => {
        void refreshData();
    }, []);

    useEffect(() => {
        (async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle();

            setProfile(
                (data as Profile | null) ?? {
                    id: user.id,
                    username: user.email?.split("@")[0] ?? "you",
                    display_name: null,
                    avatar_url: null,
                },
            );
        })();
    }, []);

    async function refreshData() {
        const [nextPosts, nextState] = await Promise.all([
            getAllPosts(),
            readFanlyState(),
        ]);
        setPosts(nextPosts);
        setState(nextState);
    }

    async function refreshState() {
        setState(await readFanlyState());
    }

    const filteredPosts = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return posts.filter((post) => {
            const matchesMode =
                mode === "for-you" ||
                (mode === "following" &&
                    state.followedCreatorIds.includes(post.creatorId)) ||
                (mode === "media" && Boolean(post.mediaUrl));
            const matchesQuery =
                !normalized ||
                post.caption.toLowerCase().includes(normalized) ||
                post.authorName.toLowerCase().includes(normalized) ||
                post.authorHandle.toLowerCase().includes(normalized);

            return matchesMode && matchesQuery;
        });
    }, [mode, posts, query, state.followedCreatorIds]);

    async function handleCreatePost({
        caption,
        file,
    }: {
        caption: string;
        file: File | null;
    }) {
        const mediaUrl = file ? await readFileAsDataUrl(file) : undefined;
        const mediaType = file
            ? file.type.startsWith("video/")
                ? "video"
                : "image"
            : undefined;
        const authorName = profile?.display_name || profile?.username || "you";
        const authorHandle = profile?.username || "you";
        const authorAvatar = profile?.avatar_url || "";
        const created = await createFanlyPost({
            authorUserId: profile?.id || "me",
            authorName,
            authorHandle,
            authorAvatar,
            caption: caption.trim(),
            mediaUrl,
            mediaType,
        });

        setPosts((current) => [created, ...current]);
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
                <LeftRail mode={mode} setMode={setMode} />
                <main className="space-y-5">
                    <FeedControls
                        mode={mode}
                        query={query}
                        setMode={setMode}
                        setQuery={setQuery}
                    />
                    <Composer onCreate={handleCreatePost} />
                    {filteredPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            state={state}
                            onBookmark={async () => {
                                await togglePostBookmark(
                                    post.id,
                                    state.bookmarkedPostIds.includes(post.id),
                                );
                                await refreshData();
                            }}
                            onLike={async () => {
                                await togglePostLike(
                                    post.id,
                                    state.likedPostIds.includes(post.id),
                                );
                                await refreshData();
                            }}
                            onSubscribe={async () => {
                                await toggleCreatorSubscription(
                                    post.creatorId,
                                    state.subscribedCreatorIds.includes(
                                        post.creatorId,
                                    ),
                                );
                                await refreshState();
                            }}
                        />
                    ))}
                    {!filteredPosts.length && (
                        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                            No posts match this feed.
                        </div>
                    )}
                </main>
                <RightRail state={state} refreshState={refreshState} />
            </div>
        </div>
    );
}

function FeedControls({
    mode,
    query,
    setMode,
    setQuery,
}: {
    mode: FeedMode;
    query: string;
    setMode: (mode: FeedMode) => void;
    setQuery: (query: string) => void;
}) {
    const modes: Array<{ id: FeedMode; label: string }> = [
        { id: "for-you", label: "For You" },
        { id: "following", label: "Following" },
        { id: "media", label: "Media" },
    ];

    return (
        <section className="rounded-xl border border-border bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="grid grid-cols-3 rounded-lg border border-border bg-background/60 p-1">
                    {modes.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setMode(item.id)}
                            className={`h-9 rounded-md px-3 text-xs font-semibold transition ${
                                mode === item.id
                                    ? "bg-card text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <label className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search feed"
                        className="h-11 w-full rounded-full border border-border bg-background/60 pl-9 pr-4 text-sm outline-none focus:border-primary"
                    />
                </label>
            </div>
        </section>
    );
}

function Composer({
    onCreate,
}: {
    onCreate: (values: { caption: string; file: File | null }) => Promise<void>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [caption, setCaption] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [posting, setPosting] = useState(false);

    async function submit() {
        if (!caption.trim() && !file) return;
        setPosting(true);
        try {
            await onCreate({ caption, file });
            setCaption("");
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
            toast.success("Posted");
        } catch {
            toast.error("Could not create post");
        } finally {
            setPosting(false);
        }
    }

    return (
        <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-success" />
                <textarea
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    placeholder="What's on your mind?"
                    rows={2}
                    className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
            </div>
            {file && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm">
                    <span className="truncate text-muted-foreground">
                        {file.name}
                    </span>
                    <button
                        aria-label="Remove media"
                        onClick={() => setFile(null)}
                        className="rounded-full p-1 hover:bg-card"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex gap-1 text-muted-foreground">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(event) =>
                            setFile(event.target.files?.[0] ?? null)
                        }
                    />
                    <IconButton
                        label="Upload media"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                        label="Image"
                        onClick={() => inputRef.current?.click()}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                        label="Video"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Video className="h-4 w-4" />
                    </IconButton>
                </div>
                <button
                    onClick={submit}
                    disabled={posting || (!caption.trim() && !file)}
                    className="inline-flex items-center gap-2 rounded-full bg-success px-4 py-1.5 text-xs font-semibold text-success-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {posting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Post
                </button>
            </div>
        </section>
    );
}

function PostCard({
    onBookmark,
    onLike,
    onSubscribe,
    post,
    state,
}: {
    onBookmark: () => void;
    onLike: () => void;
    onSubscribe: () => void;
    post: FeedPost;
    state: FanlyState;
}) {
    const [revealed, setRevealed] = useState(!post.sensitive);
    const liked = state.likedPostIds.includes(post.id);
    const bookmarked = state.bookmarkedPostIds.includes(post.id);
    const subscribed = state.subscribedCreatorIds.includes(post.creatorId);
    const locked = Boolean(post.subscribersOnly && !subscribed);
    const [unlockOpen, setUnlockOpen] = useState(false);

    function handleSubscribeFromBundle() {
        onSubscribe();
        setUnlockOpen(false);
    }

    return (
        <article className="overflow-hidden rounded-xl border border-border bg-card">
            {unlockOpen && (
                <UnlockBundleModal
                    onClose={() => setUnlockOpen(false)}
                    onSubscribe={handleSubscribeFromBundle}
                />
            )}
            <div className="flex items-center gap-3 px-4 py-3">
                <Avatar src={post.authorAvatar} fallback={post.authorName} />
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                        {post.authorName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                        @{post.authorHandle} · {formatTimeAgo(post.createdAt)}
                    </div>
                </div>
                <IconButton label="More">
                    <MoreHorizontal className="h-5 w-5" />
                </IconButton>
            </div>
            {post.mediaUrl && (
                <div
                    className={`relative bg-background ${locked ? "cursor-pointer" : ""}`}
                    onClick={() => {
                        if (locked) setUnlockOpen(true);
                    }}
                >
                    {post.mediaType === "video" ? (
                        <video
                            src={post.mediaUrl}
                            controls={!locked && revealed}
                            className={`max-h-[560px] w-full ${locked || !revealed ? "blur-2xl" : ""}`}
                        />
                    ) : (
                        <img
                            src={post.mediaUrl}
                            alt=""
                            className={`max-h-[560px] w-full object-cover ${locked || !revealed ? "scale-105 blur-2xl" : ""}`}
                        />
                    )}
                    {locked && (
                        <Overlay
                            icon={<Lock className="h-8 w-8" />}
                            title="Subscribers only"
                            text="Subscribe to unlock this post."
                            action="View"
                            onAction={() => setUnlockOpen(true)}
                        />
                    )}
                    {!locked && !revealed && (
                        <Overlay
                            icon={<EyeOff className="h-8 w-8" />}
                            title="Sensitive content"
                            text="This content may be sensitive."
                            action="View"
                            onAction={() => setRevealed(true)}
                        />
                    )}
                </div>
            )}
            <div className="p-4">
                <p className="whitespace-pre-wrap text-sm">{post.caption}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <button
                            onClick={onLike}
                            className={`flex items-center gap-1 text-sm hover:text-foreground ${liked ? "text-primary" : ""}`}
                        >
                            <Heart
                                className={`h-5 w-5 ${liked ? "fill-current" : ""}`}
                            />
                            {post.likes + (liked ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1 text-sm hover:text-foreground">
                            <MessageCircle className="h-5 w-5" /> 0
                        </button>
                    </div>
                    <button
                        onClick={onBookmark}
                        className={`rounded-full p-2 hover:bg-background/60 ${bookmarked ? "text-primary" : "text-muted-foreground"}`}
                        aria-label="Bookmark post"
                    >
                        <Bookmark
                            className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
                        />
                    </button>
                </div>
            </div>
        </article>
    );
}

function UnlockBundleModal({
    onClose,
    onSubscribe,
}: {
    onClose: () => void;
    onSubscribe: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
            onClick={onClose}
        >
            <section
                className="w-full max-w-[640px] rounded-md border border-border bg-card text-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-lg font-bold">Unlock Bundle</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-1 text-[#c5d7ff] transition hover:bg-background hover:text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <div className="mx-5 mb-5 rounded-md bg-background/70 px-4 py-4">
                    <p className="mb-3 text-base text-[#7894c8]">
                        Subscribe to any of the Tiers below
                    </p>
                    <PlanButton
                        label="Subscription 1 Month"
                        price="$3.50"
                        note="First Month 65% Off!"
                        onClick={onSubscribe}
                    />

                    <div className="my-3 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Tags className="h-4 w-4" />
                            Additional Plans
                        </div>
                        <ChevronUp className="h-5 w-5 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <PlanButton
                            label="Subscription 3 Months"
                            price="$16.50"
                            note="45% Off!"
                            onClick={onSubscribe}
                        />
                        <PlanButton
                            label="Subscription 6 Months"
                            price="$30"
                            note="50% Off!"
                            onClick={onSubscribe}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function PlanButton({
    label,
    note,
    onClick,
    price,
}: {
    label: string;
    note: string;
    onClick: () => void;
    price: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex min-h-10 w-full items-center justify-between gap-4 rounded-full bg-primary px-4 py-2 text-left text-sm font-bold text-primary-foreground transition hover:brightness-110"
        >
            <span>{label}</span>
            <span className="text-right">
                {price} <span className="text-xs">({note})</span>
            </span>
        </button>
    );
}

function Overlay({
    action,
    icon,
    onAction,
    text,
    title,
}: {
    action: string;
    icon: React.ReactNode;
    onAction: () => void;
    text: string;
    title: string;
}) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 text-center backdrop-blur-sm">
            {icon}
            <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{text}</div>
            </div>
            <button
                onClick={onAction}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
                {action}
            </button>
        </div>
    );
}

function LeftRail({
    mode,
    setMode,
}: {
    mode: FeedMode;
    setMode: (mode: FeedMode) => void;
}) {
    return (
        <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1">
                {[
                    ["for-you", "For You"],
                    ["following", "Following"],
                    ["media", "Media"],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setMode(id as FeedMode)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            mode === id
                                ? "bg-card text-foreground"
                                : "text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                    >
                        <ListFilter className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

function RightRail({
    refreshState,
    state,
}: {
    refreshState: () => Promise<void>;
    state: FanlyState;
}) {
    return (
        <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
                <section className="rounded-xl border border-border bg-card p-4">
                    <h2 className="text-sm font-semibold">Suggested</h2>
                    <div className="mt-4 space-y-3">
                        {creators.map((creator) => {
                            const followed = state.followedCreatorIds.includes(
                                creator.id,
                            );
                            return (
                                <div
                                    key={creator.id}
                                    className="flex items-center gap-3"
                                >
                                    <Avatar
                                        src={creator.avatar}
                                        fallback={creator.name}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium">
                                            {creator.name}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            @{creator.handle}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await toggleCreatorFollow(
                                                creator.id,
                                                followed,
                                            );
                                            await refreshState();
                                        }}
                                        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:brightness-110"
                                    >
                                        {followed ? "Following" : "Follow"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </aside>
    );
}

function IconButton({
    children,
    label,
    onClick,
}: {
    children: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            aria-label={label}
            onClick={onClick}
            className="rounded-full p-2 text-foreground/80 transition hover:bg-background/60 hover:text-foreground"
        >
            {children}
        </button>
    );
}

function Avatar({ fallback, src }: { fallback: string; src?: string }) {
    if (src) {
        return (
            <img
                src={src}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success text-sm font-semibold text-background">
            {fallback.charAt(0).toUpperCase()}
        </div>
    );
}

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
