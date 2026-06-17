import { z } from "zod";
import { handleApiError, ok, parseJson } from "../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const createPostSchema = z.object({
    caption: z.string().default(""),
    mediaUrl: z.string().url().nullable().optional(),
    mediaType: z.enum(["image", "video"]).nullable().optional(),
    sensitive: z.boolean().optional(),
    subscribersOnly: z.boolean().optional(),
});

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from("fanly_posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return ok({ posts: data ?? [] });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        const body = await parseJson(request, createPostSchema);

        const { data: profile } = await supabaseAdmin()
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

        const username =
            profile?.username ??
            user.email?.split("@")[0] ??
            "naked-profile-user";
        const displayName = profile?.display_name ?? username;

        const { data, error } = await supabaseAdmin()
            .from("fanly_posts")
            .insert({
                author_user_id: user.id,
                creator_id: user.id,
                author_name: displayName,
                author_handle: username,
                author_avatar: profile?.avatar_url ?? null,
                caption: body.caption?.trim() ?? "",
                media_url: body.mediaUrl ?? null,
                media_type: body.mediaType ?? null,
                sensitive: body.sensitive ?? false,
                subscribers_only: body.subscribersOnly ?? false,
            })
            .select("*")
            .single();

        if (error) throw error;
        return ok({ post: data }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
