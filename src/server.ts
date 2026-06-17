import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
    handleCreateCheckoutSession,
    handleStripeWebhook,
} from "./lib/payment-api";

type ServerEntry = {
    fetch: (
        request: Request,
        env: unknown,
        ctx: unknown,
    ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
    if (!serverEntryPromise) {
        serverEntryPromise = import("@tanstack/react-start/server-entry").then(
            (m) =>
                (m as { default?: ServerEntry }).default ??
                (m as unknown as ServerEntry),
        );
    }
    return serverEntryPromise;
}

function brandedErrorResponse(): Response {
    return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}

function readPublicEnv(env: unknown, name: string): string | undefined {
    if (!env || typeof env !== "object") return undefined;
    const value = (env as Record<string, unknown>)[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function runtimeConfigScript(env: unknown): string | undefined {
    const config = {
        VITE_SUPABASE_URL: readPublicEnv(env, "VITE_SUPABASE_URL"),
        VITE_SUPABASE_PUBLISHABLE_KEY: readPublicEnv(
            env,
            "VITE_SUPABASE_PUBLISHABLE_KEY",
        ),
    };

    if (!config.VITE_SUPABASE_URL || !config.VITE_SUPABASE_PUBLISHABLE_KEY) {
        return undefined;
    }

    const json = JSON.stringify(config).replace(/</g, "\\u003c");
    return `<script>window.__APP_CONFIG__=${json};</script>`;
}

async function withRuntimeClientConfig(
    response: Response,
    env: unknown,
): Promise<Response> {
    const script = runtimeConfigScript(env);
    if (!script) return response;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.clone().text();
    const body = html.includes("</head>")
        ? html.replace("</head>", `${script}</head>`)
        : `${script}${html}`;
    const headers = new Headers(response.headers);
    headers.delete("content-length");

    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

function isCatastrophicSsrErrorBody(
    body: string,
    responseStatus: number,
): boolean {
    let payload: unknown;
    try {
        payload = JSON.parse(body);
    } catch {
        return false;
    }

    if (!payload || Array.isArray(payload) || typeof payload !== "object") {
        return false;
    }

    const fields = payload as Record<string, unknown>;
    const expectedKeys = new Set(["message", "status", "unhandled"]);
    if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
        return false;
    }

    return (
        fields.unhandled === true &&
        fields.message === "HTTPError" &&
        (fields.status === undefined || fields.status === responseStatus)
    );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
    response: Response,
): Promise<Response> {
    if (response.status < 500) return response;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return response;

    const body = await response.clone().text();
    if (!isCatastrophicSsrErrorBody(body, response.status)) {
        return response;
    }

    console.error(
        consumeLastCapturedError() ??
            new Error(`h3 swallowed SSR error: ${body}`),
    );
    return brandedErrorResponse();
}

export default {
    async fetch(request: Request, env: unknown, ctx: unknown) {
        try {
            const url = new URL(request.url);
            if (
                request.method === "POST" &&
                url.pathname === "/api/payments/create-checkout-session"
            ) {
                return await handleCreateCheckoutSession(request);
            }

            if (
                request.method === "POST" &&
                url.pathname === "/api/payments/webhook"
            ) {
                return await handleStripeWebhook(request);
            }

            const handler = await getServerEntry();
            const response = await handler.fetch(request, env, ctx);
            const normalized = await normalizeCatastrophicSsrResponse(response);
            return await withRuntimeClientConfig(normalized, env);
        } catch (error) {
            console.error(error);
            return brandedErrorResponse();
        }
    },
};
