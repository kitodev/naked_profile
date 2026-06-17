import { z } from "zod";
import { handleApiError, ok, parseJson } from "../../../../lib/http";
import { createStripeCheckoutSession } from "../../../../lib/stripe";

export const runtime = "nodejs";

const checkoutSchema = z.object({
    amount: z.number().int().positive().optional(),
    currency: z.string().min(3).max(3).optional(),
    mode: z.enum(["payment", "setup"]).optional(),
    name: z.string().min(1).optional(),
    origin: z.string().url().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await parseJson(request, checkoutSchema);
        return ok(await createStripeCheckoutSession(body));
    } catch (error) {
        return handleApiError(error);
    }
}
