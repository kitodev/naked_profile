import creator1 from "../assets/creator1.jpg";
import creator2 from "../assets/creator2.jpg";
import creator3 from "../assets/creator3.jpg";
import creator4 from "../assets/creator4.jpg";
import { supabase } from "../integrations/supabase/client";

export type Creator = {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    category: string;
    price: string;
    verified?: boolean;
};

export type FeedPost = {
    id: string;
    creatorId: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    caption: string;
    createdAt: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    sensitive?: boolean;
    subscribersOnly?: boolean;
    likes: number;
    bookmarks: number;
};

export type FanlyState = {
    likedPostIds: string[];
    bookmarkedPostIds: string[];
    followedCreatorIds: string[];
    subscribedCreatorIds: string[];
};

type FanlyPostRow = {
    id: string;
    creator_id: string | null;
    author_user_id: string | null;
    author_name: string;
    author_handle: string;
    author_avatar: string | null;
    caption: string;
    media_url: string | null;
    media_type: "image" | "video" | null;
    sensitive: boolean;
    subscribers_only: boolean;
    created_at: string;
    like_count?: number | null;
    bookmark_count?: number | null;
};

export const FANLY_STATE_EVENT = "fanly-state-change";

export const creators: Creator[] = [
    {
        id: "aria",
        name: "Aria Mae",
        handle: "ariamae",
        avatar: creator1,
        category: "Lifestyle",
        price: "$9.99/mo",
        verified: true,
    },
    {
        id: "marcus",
        name: "Marcus Reid",
        handle: "marcusreid",
        avatar: creator2,
        category: "Fitness",
        price: "$12.99/mo",
        verified: true,
    },
    {
        id: "luna",
        name: "Luna Park",
        handle: "lunapark",
        avatar: creator3,
        category: "Cosplay",
        price: "$7.99/mo",
        verified: true,
    },
    {
        id: "theo",
        name: "Theo Vance",
        handle: "theovance",
        avatar: creator4,
        category: "Music",
        price: "$5.99/mo",
        verified: false,
    },
];

export const seedPosts: FeedPost[] = [
    {
        id: "seed-aria-1",
        creatorId: "aria",
        authorName: "Aria Mae",
        authorHandle: "ariamae",
        authorAvatar: creator1,
        caption: "Behind the scenes from today's shoot.",
        createdAt: "2026-06-12T08:00:00.000Z",
        mediaUrl: creator1,
        mediaType: "image",
        sensitive: true,
        subscribersOnly: false,
        likes: 34,
        bookmarks: 8,
    },
    {
        id: "seed-luna-1",
        creatorId: "luna",
        authorName: "Luna Park",
        authorHandle: "lunapark",
        authorAvatar: creator3,
        caption: "New set is live for subscribers.",
        createdAt: "2026-06-12T06:00:00.000Z",
        mediaUrl: creator3,
        mediaType: "image",
        subscribersOnly: true,
        likes: 124,
        bookmarks: 12,
    },
    {
        id: "seed-theo-1",
        creatorId: "theo",
        authorName: "Theo Vance",
        authorHandle: "theovance",
        authorAvatar: creator4,
        caption: "Studio preview. Full track drops tonight.",
        createdAt: "2026-06-11T22:00:00.000Z",
        mediaUrl: creator4,
        mediaType: "image",
        sensitive: false,
        subscribersOnly: false,
        likes: 88,
        bookmarks: 4,
    },
    {
        id: "seed-marcus-1",
        creatorId: "marcus",
        authorName: "Marcus Reid",
        authorHandle: "marcusreid",
        authorAvatar: creator2,
        caption: "Subscriber workout plan update is ready.",
        createdAt: "2026-06-11T07:00:00.000Z",
        mediaUrl: creator2,
        mediaType: "image",
        subscribersOnly: true,
        likes: 51,
        bookmarks: 7,
    },
];

export const defaultState: FanlyState = {
    likedPostIds: [],
    bookmarkedPostIds: [],
    followedCreatorIds: ["aria", "luna"],
    subscribedCreatorIds: [],
};

export async function readFanlyState(): Promise<FanlyState> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return defaultState;

    const [likes, bookmarks, follows, subscriptions] = await Promise.all([
        supabase
            .from("fanly_post_likes")
            .select("post_id")
            .eq("user_id", user.id),
        supabase
            .from("fanly_post_bookmarks")
            .select("post_id")
            .eq("user_id", user.id),
        supabase
            .from("fanly_creator_follows")
            .select("creator_id")
            .eq("user_id", user.id),
        supabase
            .from("fanly_creator_subscriptions")
            .select("creator_id")
            .eq("user_id", user.id)
            .eq("status", "active"),
    ]);

    return {
        likedPostIds:
            likes.data?.map((item: { post_id: string }) => item.post_id) ?? [],
        bookmarkedPostIds:
            bookmarks.data?.map((item: { post_id: string }) => item.post_id) ??
            [],
        followedCreatorIds:
            follows.data?.map(
                (item: { creator_id: string }) => item.creator_id,
            ) ?? defaultState.followedCreatorIds,
        subscribedCreatorIds:
            subscriptions.data?.map(
                (item: { creator_id: string }) => item.creator_id,
            ) ?? [],
    };
}

export async function getAllPosts(): Promise<FeedPost[]> {
    const { data, error } = await supabase
        .from("fanly_posts")
        .select(
            "id, creator_id, author_user_id, author_name, author_handle, author_avatar, caption, media_url, media_type, sensitive, subscribers_only, created_at, like_count, bookmark_count",
        )
        .order("created_at", { ascending: false });

    if (error) return seedPosts;

    const posts = ((data as FanlyPostRow[] | null) ?? []).map(mapPostRow);
    const dbSeedIds = new Set(posts.map((post) => post.id));
    const missingSeeds = seedPosts.filter((post) => !dbSeedIds.has(post.id));

    return [...posts, ...missingSeeds].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function createFanlyPost(values: {
    authorUserId: string;
    authorName: string;
    authorHandle: string;
    authorAvatar?: string | null;
    caption: string;
    mediaUrl?: string | null;
    mediaType?: "image" | "video" | null;
}): Promise<FeedPost> {
    const { data, error } = await supabase
        .from("fanly_posts")
        .insert({
            author_user_id: values.authorUserId,
            creator_id: values.authorUserId,
            author_name: values.authorName,
            author_handle: values.authorHandle,
            author_avatar: values.authorAvatar ?? null,
            caption: values.caption,
            media_url: values.mediaUrl ?? null,
            media_type: values.mediaType ?? null,
        })
        .select(
            "id, creator_id, author_user_id, author_name, author_handle, author_avatar, caption, media_url, media_type, sensitive, subscribers_only, created_at, like_count, bookmark_count",
        )
        .single();

    if (error) throw error;
    return mapPostRow(data as FanlyPostRow);
}

export async function togglePostLike(postId: string, liked: boolean) {
    const userId = await requireUserId();
    if (liked) {
        await supabase
            .from("fanly_post_likes")
            .delete()
            .eq("user_id", userId)
            .eq("post_id", postId);
    } else {
        await supabase
            .from("fanly_post_likes")
            .insert({ user_id: userId, post_id: postId });
    }
}

export async function togglePostBookmark(postId: string, bookmarked: boolean) {
    const userId = await requireUserId();
    if (bookmarked) {
        await supabase
            .from("fanly_post_bookmarks")
            .delete()
            .eq("user_id", userId)
            .eq("post_id", postId);
    } else {
        await supabase
            .from("fanly_post_bookmarks")
            .insert({ user_id: userId, post_id: postId });
    }
}

export async function toggleCreatorFollow(
    creatorId: string,
    followed: boolean,
) {
    const userId = await requireUserId();
    if (followed) {
        await supabase
            .from("fanly_creator_follows")
            .delete()
            .eq("user_id", userId)
            .eq("creator_id", creatorId);
    } else {
        await supabase
            .from("fanly_creator_follows")
            .insert({ user_id: userId, creator_id: creatorId });
    }
}

export async function toggleCreatorSubscription(
    creatorId: string,
    subscribed: boolean,
) {
    const userId = await requireUserId();
    if (subscribed) {
        await supabase
            .from("fanly_creator_subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("creator_id", creatorId);
    } else {
        await supabase.from("fanly_creator_subscriptions").insert({
            user_id: userId,
            creator_id: creatorId,
            status: "active",
        });
    }
}

export function toggleListValue(list: string[], value: string) {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}

export function formatTimeAgo(date: string) {
    const minutes = Math.max(
        1,
        Math.round((Date.now() - new Date(date).getTime()) / 60000),
    );

    if (minutes < 60) return `${minutes}m`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h`;

    return `${Math.round(hours / 24)}d`;
}

function mapPostRow(row: FanlyPostRow): FeedPost {
    const creator = creators.find((item) => item.id === row.creator_id);

    return {
        id: row.id,
        creatorId: row.creator_id ?? row.author_user_id ?? row.id,
        authorName: row.author_name,
        authorHandle: row.author_handle,
        authorAvatar: row.author_avatar || creator?.avatar || "",
        caption: row.caption,
        createdAt: row.created_at,
        mediaUrl: row.media_url || creator?.avatar,
        mediaType: row.media_type ?? (creator ? "image" : undefined),
        sensitive: row.sensitive,
        subscribersOnly: row.subscribers_only,
        likes: row.like_count ?? 0,
        bookmarks: row.bookmark_count ?? 0,
    };
}

async function requireUserId() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("You must be logged in.");
    return user.id;
}
