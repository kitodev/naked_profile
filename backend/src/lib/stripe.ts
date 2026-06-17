import { appUrl, requireEnv } from "./env";

export type CheckoutRequest = {
    amount?: number;
    currency?: string;
    mode?: "payment" | "setup";
    name?: string;
    origin?: string;
};

export async function createStripeCheckoutSession(body: CheckoutRequest) {
    const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
    const mode = body.mode ?? "setup";
    const origin = body.origin ?? appUrl();

    const params = new URLSearchParams({
        mode,
        success_url: `${origin}/payment-method?payment=success`,
        cancel_url: `${origin}/payment-method?payment=cancelled`,
    });

    params.set("payment_method_types[0]", "card");

    if (mode === "payment") {
        params.set("line_items[0][quantity]", "1");
        params.set(
            "line_items[0][price_data][currency]",
            body.currency ?? "usd",
        );
        params.set(
            "line_items[0][price_data][unit_amount]",
            String(body.amount ?? 500),
        );
        params.set(
            "line_items[0][price_data][product_data][name]",
            body.name ?? "Naked Profile payment",
        );
    }

    const response = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
            method: "POST",
            headers: {
                authorization: `Bearer ${stripeSecretKey}`,
                "content-type": "application/x-www-form-urlencoded",
            },
            body: params,
        },
    );

    const session = (await response.json()) as {
        error?: { message: string };
        url?: string;
    };

    if (!response.ok || !session.url) {
        throw new Error(
            session.error?.message ?? "Could not create checkout session.",
        );
    }

    return { url: session.url };
}
