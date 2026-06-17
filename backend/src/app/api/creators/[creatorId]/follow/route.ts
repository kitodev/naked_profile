import { handleApiError, ok } from "../../../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";

type Context = { params: Promise<{ creatorId: string }> };

export async function POST(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { creatorId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_creator_follows")
            .insert({ creator_id: creatorId, user_id: user.id });

        if (error && error.code !== "23505") throw error;
        return ok({ followed: true });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: Context) {
    try {
        const user = await requireUser(request);
        const { creatorId } = await context.params;

        const { error } = await supabaseAdmin()
            .from("fanly_creator_follows")
            .delete()
            .eq("creator_id", creatorId)
            .eq("user_id", user.id);

        if (error) throw error;
        return ok({ followed: false });
    } catch (error) {
        return handleApiError(error);
    }
}
