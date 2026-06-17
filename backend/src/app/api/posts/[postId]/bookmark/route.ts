import { handleApiError, ok } from "../../../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";

type Context = { params: Promise<{ postId: string }> };

export async function POST(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { postId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_post_bookmarks")
            .insert({ post_id: postId, user_id: user.id });

        if (error && error.code !== "23505") throw error;
        return ok({ bookmarked: true });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { postId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_post_bookmarks")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);

        if (error) throw error;
        return ok({ bookmarked: false });
    } catch (error) {
        return handleApiError(error);
    }
}
