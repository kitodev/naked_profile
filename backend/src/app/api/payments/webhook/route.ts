import { ok } from "../../../../lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    return ok({
        received: true,
        hasSignature: Boolean(signature),
        bytes: payload.length,
        warning:
            "Webhook verification endpoint exists. Connect STRIPE_WEBHOOK_SECRET handling before production billing events.",
    });
}
