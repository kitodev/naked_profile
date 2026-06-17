import { NextResponse } from "next/server";
import { createAgeVerifAuthorizationUrl } from "../../../../lib/ageverif";
import { handleApiError } from "../../../../lib/http";
import {
    hasSupabaseServiceRoleKey,
    requireUser,
    supabaseAdmin,
    supabaseUserClient,
} from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
    return corsResponse(request, null, { status: 204 });
}

export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        const db = hasSupabaseServiceRoleKey()
            ? supabaseAdmin()
            : supabaseUserClient(request);

        const { data: profile } = await db
            .from("profiles")
            .select("username, display_name")
            .eq("id", user.id)
            .maybeSingle();

        const username =
            profile?.username ?? user.email?.split("@")[0] ?? user.id;

        const verificationUrl = createAgeVerifAuthorizationUrl({
            userId: user.id,
        });

        const { data, error } = await db
            .from("creator_applications")
            .upsert(
                {
                    bio: "Identity verification started.",
                    category: "Pending verification",
                    display_name: profile?.display_name ?? username,
                    handle: username,
                    identity_verification_status: "created",
                    identity_verification_url: verificationUrl,
                    identity_verification_payload: {
                        provider: "ageverif",
                        startedAt: new Date().toISOString(),
                    },
                    payout_email: user.email ?? `${user.id}@nakedprofile.local`,
                    status: "pending",
                    user_id: user.id,
                },
                { onConflict: "user_id" },
            )
            .select("*")
            .single();

        if (error) throw error;

        return corsResponse(
            request,
            {
                application: data,
                verificationUrl,
            },
            { status: 201 },
        );
    } catch (error) {
        return withCors(request, handleApiError(error));
    }
}

function corsHeaders(request: Request) {
    return {
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-origin": request.headers.get("origin") ?? "*",
        vary: "Origin",
    };
}

function corsResponse(request: Request, body: unknown, init?: ResponseInit) {
    if (body === null) {
        return new NextResponse(null, {
            ...init,
            headers: { ...corsHeaders(request), ...init?.headers },
        });
    }

    return NextResponse.json(body, {
        ...init,
        headers: { ...corsHeaders(request), ...init?.headers },
    });
}

function withCors(request: Request, response: Response) {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(request))) {
        headers.set(key, value);
    }

    return new NextResponse(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText,
    });
}
