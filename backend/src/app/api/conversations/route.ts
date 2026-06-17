import { z } from "zod";
import { handleApiError, ok, parseJson } from "../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const createConversationSchema = z.object({
    creatorId: z.string().min(1),
});

export async function GET(request: Request) {
    try {
        const user = await requireUser(request);

        const { data, error } = await supabaseAdmin()
            .from("fanly_conversations")
            .select("*, fanly_messages(*)")
            .eq("user_id", user.id)
            .order("last_message_at", { ascending: false });

        if (error) throw error;
        return ok({ conversations: data ?? [] });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        const body = await parseJson(request, createConversationSchema);

        const { data, error } = await supabaseAdmin()
            .from("fanly_conversations")
            .upsert(
                {
                    user_id: user.id,
                    creator_id: body.creatorId,
                    last_message_at: new Date().toISOString(),
                },
                { onConflict: "user_id,creator_id" },
            )
            .select("*")
            .single();

        if (error) throw error;
        return ok({ conversation: data }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
