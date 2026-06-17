export type CheckoutRequest = {
    amount?: number;
    currency?: string;
    mode?: "payment" | "setup";
    name?: string;
    origin?: string;
};

function json(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "content-type": "application/json",
            ...init?.headers,
        },
    });
}

function getStripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY;
}

export async function createStripeCheckoutSession(body: CheckoutRequest) {
    const stripeSecretKey = getStripeSecretKey();

    if (!stripeSecretKey) {
        throw new Error(
            "Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.",
        );
    }

    const mode = body.mode ?? "setup";
    const origin = body.origin ?? "http://localhost:8080";
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

export async function handleCreateCheckoutSession(request: Request) {
    try {
        const body = (await request
            .json()
            .catch(() => ({}))) as CheckoutRequest;
        const origin =
            request.headers.get("origin") ?? new URL(request.url).origin;
        return json(await createStripeCheckoutSession({ ...body, origin }));
    } catch (error) {
        return json(
            {
                error:
                    error instanceof Error ? error.message : "Checkout failed.",
            },
            { status: 500 },
        );
    }
}

export async function handleStripeWebhook(request: Request) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return json({
            received: true,
            warning:
                "STRIPE_WEBHOOK_SECRET is not configured, so this webhook was not verified.",
            hasSignature: Boolean(signature),
            bytes: payload.length,
        });
    }

    return json({
        received: true,
        warning:
            "Webhook verification is ready for the secret, but event handling has not been connected to billing tables yet.",
        hasSignature: Boolean(signature),
        bytes: payload.length,
    });
}
