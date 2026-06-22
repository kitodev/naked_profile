import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { optionalEnv, requireEnv } from "./env";
import { ApiError, parseBearerToken } from "./http";

type UntypedSupabaseClient = SupabaseClient<any>;

let adminClient: UntypedSupabaseClient | null = null;
let authClient: UntypedSupabaseClient | null = null;

export function supabaseAdmin() {
    if (!adminClient) {
        adminClient = createClient(
            requireEnv("SUPABASE_URL"),
            requireSupabaseServerKey(),
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        ) as UntypedSupabaseClient;
    }

    return adminClient;
}

export function hasSupabaseServiceRoleKey() {
    return Boolean(optionalEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function supabaseUserClient(request: Request) {
    const token = parseBearerToken(request);
    if (!token) throw new ApiError("Missing Authorization bearer token.", 401);

    return createClient(
        requireEnv("SUPABASE_URL"),
        requireSupabasePublicKey(),
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        },
    ) as UntypedSupabaseClient;
}

function supabaseAuthClient() {
    if (!authClient) {
        authClient = createClient(
            requireEnv("SUPABASE_URL"),
            requireSupabasePublicKey(),
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        ) as UntypedSupabaseClient;
    }

    return authClient;
}

export async function requireUser(request: Request) {
    const token = parseBearerToken(request);
    if (!token) throw new ApiError("Missing Authorization bearer token.", 401);

    const tokenInfo = describeJwt(token);
    if (!tokenInfo.validShape) {
        console.warn("Invalid auth token shape received.", tokenInfo);
    } else if (tokenInfo.expired) {
        console.warn("Expired auth token received.", tokenInfo);
    }

    const { data, error } = await supabaseAuthClient().auth.getUser(token);
    if (error || !data.user) {
        console.warn("Supabase rejected bearer token.", {
            ...tokenInfo,
            message: error?.message,
            status: error?.status,
        });
        throw new ApiError(error?.message ?? "Invalid session.", 401);
    }

    return data.user;
}

function describeJwt(token: string) {
    const [header, payload] = token.split(".");
    if (!header || !payload) {
        return {
            validShape: false,
            length: token.length,
        };
    }

    try {
        const fields = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8"),
        ) as Record<string, unknown>;
        const exp = typeof fields.exp === "number" ? fields.exp : undefined;
        const now = Math.floor(Date.now() / 1000);

        return {
            validShape: true,
            aud: fields.aud,
            expiresInSeconds: exp === undefined ? undefined : exp - now,
            expired: exp === undefined ? undefined : exp <= now,
            iss: fields.iss,
            role: fields.role,
            subjectPresent: typeof fields.sub === "string",
        };
    } catch {
        return {
            validShape: false,
            length: token.length,
        };
    }
}

function requireSupabaseServerKey() {
    return (
        optionalEnv("SUPABASE_SERVICE_ROLE_KEY") ?? requireSupabasePublicKey()
    );
}

function requireSupabasePublicKey() {
    return (
        optionalEnv("SUPABASE_PUBLISHABLE_KEY") ??
        optionalEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ??
        requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    );
}
