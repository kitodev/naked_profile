import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, parseJson } from "../../../lib/http";
import { requireUser, supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const applicationSchema = z.object({
    audienceSize: z.number().int().min(0).max(1_000_000_000).optional(),
    bio: z.string().trim().min(20).max(2000),
    category: z.string().trim().min(2).max(80),
    displayName: z.string().trim().min(2).max(80),
    handle: z
        .string()
        .trim()
        .min(2)
        .max(40)
        .regex(
            /^[a-zA-Z0-9_.-]+$/,
            "Handle can only contain letters, numbers, _, ., and -.",
        ),
    payoutEmail: z.string().trim().email().max(254),
    portfolioUrl: z.string().trim().url().max(500).optional(),
});

export async function OPTIONS(request: Request) {
    return corsResponse(request, null, { status: 204 });
}

export async function GET(request: Request) {
    try {
        const user = await requireUser(request);

        const { data, error } = await supabaseAdmin()
            .from("creator_applications")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;
        return corsResponse(request, { application: data });
    } catch (error) {
        return withCors(request, handleApiError(error));
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        const body = await parseJson(request, applicationSchema);

        const { data, error } = await supabaseAdmin()
            .from("creator_applications")
            .upsert(
                {
                    audience_size: body.audienceSize ?? null,
                    bio: body.bio,
                    category: body.category,
                    display_name: body.displayName,
                    handle: body.handle.toLowerCase(),
                    payout_email: body.payoutEmail,
                    portfolio_url: body.portfolioUrl ?? null,
                    status: "pending",
                    user_id: user.id,
                },
                { onConflict: "user_id" },
            )
            .select("*")
            .single();

        if (error) throw error;

        await supabaseAdmin()
            .from("profiles")
            .update({
                bio: body.bio,
                display_name: body.displayName,
                website: body.portfolioUrl ?? null,
            })
            .eq("id", user.id);

        return corsResponse(request, { application: data }, { status: 201 });
    } catch (error) {
        return withCors(request, handleApiError(error));
    }
}

function corsHeaders(request: Request) {
    return {
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "GET, POST, OPTIONS",
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
