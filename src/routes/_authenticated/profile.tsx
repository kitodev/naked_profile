import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    Bookmark,
    Compass,
    Filter,
    Home,
    Image as ImageIcon,
    List,
    Loader2,
    MessagesSquare,
    MoreHorizontal,
    Play,
    RefreshCw,
    Save,
    Search,
    Send,
    Settings,
    Trash2,
    Upload,
    UserCircle,
    UserRound,
    Video,
    Wallet,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { AppTopBar } from "../../components/app-top-bar";
import { supabase } from "../../integrations/supabase/client";
import creator1 from "../../assets/creator1.jpg";
import creator3 from "../../assets/creator3.jpg";
import creator4 from "../../assets/creator4.jpg";

export const Route = createFileRoute("/_authenticated/profile")({
    head: () => ({ meta: [{ title: "Profile - Naked Profile" }] }),
    component: ProfilePage,
});

type Tab = "posts" | "media";
type MediaType = "image" | "video";
type Profile = {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
};
type Post = {
    id: string;
    author_id: string;
    caption: string;
    media_url: string | null;
    media_path: string | null;
    media_type: MediaType | null;
    created_at: string;
};

const MEDIA_BUCKET = "profile-media";
const SUGGESTED = [
    { name: "Aria Mae", handle: "ariamae", img: creator1 },
    { name: "Luna Park", handle: "lunapark", img: creator3 },
    { name: "Theo Vance", handle: "theovance", img: creator4 },
];

function ProfilePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("posts");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadProfileData(options?: { quiet?: boolean }) {
        if (options?.quiet) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) {
                setError("Log in to edit your profile and publish posts.");
                return;
            }

            setUserId(user.id);

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url, bio")
                .eq("id", user.id)
                .maybeSingle();
            if (profileError) throw profileError;

            const fallbackProfile = {
                id: user.id,
                username: user.email?.split("@")[0] ?? "user",
                display_name: user.email?.split("@")[0] ?? "user",
                avatar_url: null,
                bio: "Hey, I am using Fansly.",
            };
            setProfile((profileData as Profile | null) ?? fallbackProfile);

            const { data: postData, error: postsError } = await supabase
                .from("profile_posts")
                .select(
                    "id, author_id, caption, media_url, media_path, media_type, created_at",
                )
                .eq("author_id", user.id)
                .order("created_at", { ascending: false });
            if (postsError) throw postsError;

            setPosts((postData as Post[] | null) ?? []);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Could not load profile timeline.";
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        void loadProfileData();
    }, []);

    const username = profile?.username || "valami123456789";
    const name = profile?.display_name || username;
    const bio = profile?.bio || "Hey, I am using Fansly.";
    const filteredPosts = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return posts.filter((post) => {
            const matchesTab = activeTab === "posts" || Boolean(post.media_url);
            const matchesSearch =
                !normalized ||
                post.caption.toLowerCase().includes(normalized) ||
                name.toLowerCase().includes(normalized) ||
                username.toLowerCase().includes(normalized);
            return matchesTab && matchesSearch;
        });
    }, [activeTab, name, posts, query, username]);

    async function handleProfileSave(values: {
        display_name: string;
        username: string;
        bio: string;
    }) {
        if (!userId) return;

        const { data, error: saveError } = await supabase
            .from("profiles")
            .update({
                display_name: values.display_name.trim(),
                username: values.username.trim(),
                bio: values.bio.trim(),
            })
            .eq("id", userId)
            .select("id, username, display_name, avatar_url, bio")
            .single();

        if (saveError) throw saveError;
        setProfile(data as Profile);
    }

    async function handleCreatePost({
        caption,
        file,
    }: {
        caption: string;
        file: File | null;
    }) {
        if (!userId) throw new Error("You need to log in before posting.");

        let mediaUrl: string | null = null;
        let mediaPath: string | null = null;
        let mediaType: MediaType | null = null;

        if (file) {
            mediaType = file.type.startsWith("video/") ? "video" : "image";
            const extension = file.name.split(".").pop() || "media";
            mediaPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(MEDIA_BUCKET)
                .upload(mediaPath, file, {
                    cacheControl: "3600",
                    contentType: file.type,
                    upsert: false,
                });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(MEDIA_BUCKET)
                .getPublicUrl(mediaPath);
            mediaUrl = data.publicUrl;
        }

        const { data, error: postError } = await supabase
            .from("profile_posts")
            .insert({
                author_id: userId,
                caption: caption.trim(),
                media_url: mediaUrl,
                media_path: mediaPath,
                media_type: mediaType,
            })
            .select(
                "id, author_id, caption, media_url, media_path, media_type, created_at",
            )
            .single();

        if (postError) throw postError;
        setPosts((current) => [data as Post, ...current]);
    }

    async function handleDeletePost(post: Post) {
        const { error: deleteError } = await supabase
            .from("profile_posts")
            .delete()
            .eq("id", post.id);
        if (deleteError) {
            toast.error(deleteError.message);
            return;
        }

        if (post.media_path) {
            await supabase.storage.from(MEDIA_BUCKET).remove([post.media_path]);
        }

        setPosts((current) => current.filter((item) => item.id !== post.id));
        toast.success("Post deleted");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <main className="space-y-5">
                    <ProfileCard
                        bio={bio}
                        name={name}
                        onSave={handleProfileSave}
                        profile={profile}
                        postsCount={posts.length}
                        setActiveTab={setActiveTab}
                        activeTab={activeTab}
                        username={username}
                    />
                    <Composer onCreate={handleCreatePost} />
                    <TimelineTools
                        activeTab={activeTab}
                        error={error}
                        filteredPosts={filteredPosts}
                        loading={loading}
                        onDelete={handleDeletePost}
                        onRefresh={() => void loadProfileData({ quiet: true })}
                        query={query}
                        refreshing={refreshing}
                        setQuery={setQuery}
                    />
                </main>
                <RightRail name={name} />
            </div>
        </div>
    );
}

function LeftNav() {
    const items = [
        { icon: Home, label: "Home", to: "/dashboard" },
        { icon: Compass, label: "Explore" },
        { icon: Bell, label: "Notifications" },
        { icon: MessagesSquare, label: "Messages" },
        { icon: Bookmark, label: "Bookmarks" },
        { icon: List, label: "Lists" },
        { icon: Video, label: "Reels" },
        { icon: Wallet, label: "Wallet" },
        { icon: UserCircle, label: "Profile", active: true },
        { icon: Settings, label: "Settings" },
    ];

    return (
        <aside className="hidden lg:block">
            <nav className="sticky top-6 space-y-1">
                {items.map(({ icon: Icon, label, active, to }) => {
                    const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                            ? "bg-card text-foreground"
                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`;

                    if (to) {
                        return (
                            <Link key={label} to={to} className={className}>
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        );
                    }

                    return (
                        <button key={label} className={className}>
                            <Icon className="h-5 w-5" />
                            {label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

function ProfileCard({
    activeTab,
    bio,
    name,
    onSave,
    postsCount,
    profile,
    setActiveTab,
    username,
}: {
    activeTab: Tab;
    bio: string;
    name: string;
    onSave: (values: {
        display_name: string;
        username: string;
        bio: string;
    }) => Promise<void>;
    postsCount: number;
    profile: Profile | null;
    setActiveTab: (tab: Tab) => void;
    username: string;
}) {
    const [editing, setEditing] = useState(false);

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-36 bg-gradient-to-r from-card via-secondary to-card" />
            <div className="relative px-4 pb-5 pt-20 sm:px-6">
                <div className="absolute left-4 top-[-72px] sm:left-6">
                    <ProfileAvatar profile={profile} />
                    <span className="absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 border-card bg-success" />
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6">
                    <button
                        onClick={() => setEditing((current) => !current)}
                        className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-accent"
                    >
                        Profile
                    </button>
                    <button
                        aria-label="More profile actions"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground/80 transition hover:bg-accent hover:text-foreground"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>

                <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    @{username}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Active Now</p>

                <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                    <p>
                        <span className="font-bold text-foreground">0</span>{" "}
                        Likes
                    </p>
                    <p>
                        <span className="font-bold text-foreground">0</span>{" "}
                        Followers
                    </p>
                    <p>
                        <span className="font-bold text-foreground">
                            {postsCount}
                        </span>{" "}
                        Posts
                    </p>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">{bio}</p>

                {editing && (
                    <EditProfileForm
                        bio={bio}
                        name={name}
                        onCancel={() => setEditing(false)}
                        onSave={async (values) => {
                            await onSave(values);
                            setEditing(false);
                            toast.success("Profile updated");
                        }}
                        username={username}
                    />
                )}
            </div>

            <div className="grid h-14 grid-cols-2 border-t border-border text-sm font-semibold">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`relative ${activeTab === "posts" ? "text-primary" : "text-muted-foreground transition hover:text-foreground"}`}
                >
                    Posts
                    {activeTab === "posts" && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("media")}
                    className={`relative ${activeTab === "media" ? "text-primary" : "text-muted-foreground transition hover:text-foreground"}`}
                >
                    Media
                    {activeTab === "media" && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                    )}
                </button>
            </div>
        </section>
    );
}

function EditProfileForm({
    bio,
    name,
    onCancel,
    onSave,
    username,
}: {
    bio: string;
    name: string;
    onCancel: () => void;
    onSave: (values: {
        display_name: string;
        username: string;
        bio: string;
    }) => Promise<void>;
    username: string;
}) {
    const [displayName, setDisplayName] = useState(name);
    const [handle, setHandle] = useState(username);
    const [profileBio, setProfileBio] = useState(bio);
    const [saving, setSaving] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setSaving(true);
        try {
            await onSave({
                display_name: displayName,
                username: handle,
                bio: profileBio,
            });
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Could not save profile",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="mt-5 rounded-xl border border-border bg-background/60 p-4"
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-muted-foreground">
                    Display name
                    <input
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                </label>
                <label className="space-y-1 text-xs font-medium text-muted-foreground">
                    Username
                    <input
                        value={handle}
                        onChange={(event) => setHandle(event.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                </label>
            </div>
            <label className="mt-3 block space-y-1 text-xs font-medium text-muted-foreground">
                Bio
                <textarea
                    value={profileBio}
                    onChange={(event) => setProfileBio(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
            </label>
            <div className="mt-3 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-success px-4 py-2 text-xs font-semibold text-success-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save
                </button>
            </div>
        </form>
    );
}

function ProfileAvatar({ profile }: { profile: Profile | null }) {
    if (profile?.avatar_url) {
        return (
            <img
                src={profile.avatar_url}
                alt=""
                className="h-36 w-36 rounded-full border-4 border-card bg-muted object-cover ring-1 ring-border"
            />
        );
    }

    return (
        <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-card bg-background ring-1 ring-border">
            <UserRound
                className="h-20 w-20 fill-muted-foreground/60 text-muted-foreground/60"
                strokeWidth={1.5}
            />
        </div>
    );
}

function Composer({
    onCreate,
}: {
    onCreate: (values: { caption: string; file: File | null }) => Promise<void>;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Posted to your timeline");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not post");
        } finally {
            setPosting(false);
        }
    }

    return (
        <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-success" />
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
                    <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        {file.type.startsWith("video/") ? (
                            <Video className="h-4 w-4 text-primary" />
                        ) : (
                            <ImageIcon className="h-4 w-4 text-primary" />
                        )}
                        <span className="truncate">{file.name}</span>
                    </div>
                    <button
                        aria-label="Remove selected media"
                        onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        className="rounded-full p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex gap-1 text-muted-foreground">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(event) =>
                            setFile(event.target.files?.[0] ?? null)
                        }
                    />
                    <button
                        aria-label="Upload media"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full p-2 text-foreground/80 hover:bg-background/60 hover:text-foreground"
                    >
                        <Upload className="h-4 w-4" />
                    </button>
                    <button
                        aria-label="Add photo"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full p-2 text-foreground/80 hover:bg-background/60 hover:text-foreground"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                        aria-label="Add video"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full p-2 text-foreground/80 hover:bg-background/60 hover:text-foreground"
                    >
                        <Video className="h-4 w-4" />
                    </button>
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

function TimelineTools({
    activeTab,
    error,
    filteredPosts,
    loading,
    onDelete,
    onRefresh,
    query,
    refreshing,
    setQuery,
}: {
    activeTab: Tab;
    error: string | null;
    filteredPosts: Post[];
    loading: boolean;
    onDelete: (post: Post) => Promise<void>;
    onRefresh: () => void;
    query: string;
    refreshing: boolean;
    setQuery: (value: string) => void;
}) {
    return (
        <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                <label className="relative block h-11 min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input
                        aria-label="Search Timeline"
                        placeholder="Search Timeline"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-full w-full rounded-full border border-border bg-background/60 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                </label>
                <button
                    aria-label="Refresh timeline"
                    onClick={onRefresh}
                    className="hidden h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-background/60 sm:flex"
                >
                    <RefreshCw
                        className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                    />
                </button>
                <button
                    aria-label="Filter timeline"
                    className="flex h-11 w-14 items-center justify-center rounded-full bg-secondary text-foreground/80 transition hover:bg-accent hover:text-foreground"
                >
                    <Filter className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex min-h-[160px] items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            ) : filteredPosts.length ? (
                <div className="mt-4 space-y-4">
                    {filteredPosts.map((post) => (
                        <TimelinePost
                            key={post.id}
                            post={post}
                            onDelete={() => onDelete(post)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <p className="text-sm">
                        {query.trim()
                            ? "No timeline posts match your search."
                            : activeTab === "media"
                              ? "This user has not uploaded media yet."
                              : "This user has not posted anything yet."}
                    </p>
                </div>
            )}
        </section>
    );
}

function TimelinePost({
    onDelete,
    post,
}: {
    onDelete: () => void;
    post: Post;
}) {
    return (
        <article className="overflow-hidden rounded-xl border border-border bg-background/60">
            {post.media_url && post.media_type === "image" && (
                <img
                    src={post.media_url}
                    alt=""
                    className="max-h-[520px] w-full object-cover"
                />
            )}
            {post.media_url && post.media_type === "video" && (
                <div className="relative bg-background">
                    <video
                        src={post.media_url}
                        controls
                        className="max-h-[520px] w-full"
                    />
                    <Play className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-foreground/70" />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                        {post.caption || "Uploaded media"}
                    </p>
                    <button
                        aria-label="Delete post"
                        onClick={onDelete}
                        className="rounded-full p-2 text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }).format(new Date(post.created_at))}
                </p>
            </div>
        </article>
    );
}

function RightRail({ name }: { name: string }) {
    return (
        <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm font-semibold">
                        Welcome back, {name}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Discover creators you'll love.
                    </p>
                    <button className="mt-3 w-full rounded-full bg-success py-2 text-xs font-semibold text-success-foreground hover:brightness-110">
                        Become A Creator
                    </button>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold">Suggested</div>
                        <button className="text-xs text-primary hover:underline">
                            See all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {SUGGESTED.map((creator) => (
                            <div
                                key={creator.handle}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="h-9 w-9 rounded-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${creator.img})`,
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium">
                                        {creator.name}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        @{creator.handle}
                                    </div>
                                </div>
                                <button className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:brightness-110">
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
