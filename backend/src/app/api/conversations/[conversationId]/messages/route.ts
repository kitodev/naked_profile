import { z } from "zod";
import { handleApiError, ok, parseJson } from "../../../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";

type Context = { params: Promise<{ conversationId: string }> };

const createMessageSchema = z.object({
    body: z.string().default(""),
    attachmentName: z.string().nullable().optional(),
    attachmentType: z.enum(["image", "file"]).nullable().optional(),
    attachmentUrl: z.string().nullable().optional(),
});

export async function POST(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { conversationId } = await context.params;
        const body = await parseJson(request, createMessageSchema);
        const now = new Date().toISOString();

        const { data, error } = await supabaseAdmin()
            .from("fanly_messages")
            .insert({
                conversation_id: conversationId,
                user_id: user.id,
                author: "me",
                body: body.body?.trim() ?? "",
                attachment_name: body.attachmentName ?? null,
                attachment_type: body.attachmentType ?? null,
                attachment_url: body.attachmentUrl ?? null,
                created_at: now,
            })
            .select("*")
            .single();

        if (error) throw error;

        await supabaseAdmin()
            .from("fanly_conversations")
            .update({ last_message_at: now, unread_count: 0 })
            .eq("id", conversationId)
            .eq("user_id", user.id);

        return ok({ message: data }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { conversationId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_messages")
            .delete()
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);

        if (error) throw error;
        return ok({ cleared: true });
    } catch (error) {
        return handleApiError(error);
    }
}
