import { z } from "zod";
import { handleApiError, ok, parseJson } from "../../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

type Context = { params: Promise<{ conversationId: string }> };

const updateConversationSchema = z.object({
    archived: z.boolean().optional(),
    favorite: z.boolean().optional(),
    muted: z.boolean().optional(),
    unreadCount: z.number().int().min(0).optional(),
});

export async function PATCH(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { conversationId } = await context.params;
        const body = await parseJson(request, updateConversationSchema);

        const { data, error } = await supabaseAdmin()
            .from("fanly_conversations")
            .update({
                archived: body.archived,
                favorite: body.favorite,
                muted: body.muted,
                unread_count: body.unreadCount,
            })
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .select("*")
            .single();

        if (error) throw error;
        return ok({ conversation: data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { conversationId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_conversations")
            .delete()
            .eq("id", conversationId)
            .eq("user_id", user.id);

        if (error) throw error;
        return ok({ deleted: true });
    } catch (error) {
        return handleApiError(error);
    }
}
