import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { optionalEnv, requireEnv } from "./env";
import { ApiError, parseBearerToken } from "./http";

type UntypedSupabaseClient = SupabaseClient<any>;

let adminClient: UntypedSupabaseClient | null = null;

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
                    authorization: `Bearer ${token}`,
                },
            },
        },
    ) as UntypedSupabaseClient;
}

export async function requireUser(request: Request) {
    const token = parseBearerToken(request);
    if (!token) throw new ApiError("Missing Authorization bearer token.", 401);

    const client = hasSupabaseServiceRoleKey()
        ? supabaseAdmin()
        : supabaseUserClient(request);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
        throw new ApiError(error?.message ?? "Invalid session.", 401);
    }

    return data.user;
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
