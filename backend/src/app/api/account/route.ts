import { NextResponse } from "next/server";
import { z } from "zod";
import {
    ApiError,
    handleApiError,
    parseJson,
    parseBearerToken,
} from "../../../lib/http";
import {
    hasSupabaseServiceRoleKey,
    requireUser,
    supabaseAdmin,
    supabaseUserClient,
} from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const updateAccountSchema = z
    .object({
        displayName: z.string().trim().min(1).max(80).optional(),
        email: z.string().trim().email().max(254).optional(),
        password: z.string().min(8).max(128).optional(),
        username: z
            .string()
            .trim()
            .min(2)
            .max(40)
            .regex(
                /^[a-zA-Z0-9_.-]+$/,
                "Username can only contain letters, numbers, _, ., and -.",
            )
            .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "No account changes were provided.",
    });

export async function OPTIONS(request: Request) {
    return corsResponse(request, null, { status: 204 });
}

export async function PATCH(request: Request) {
    try {
        const user = await requireUser(request);
        const body = await parseJson(request, updateAccountSchema);
        const dbClient = hasSupabaseServiceRoleKey()
            ? supabaseAdmin()
            : supabaseUserClient(request);
        const profileUpdates: Record<string, string> = {};

        if (body.username) {
            profileUpdates.username = body.username.toLowerCase();
        }

        if (body.displayName) {
            profileUpdates.display_name = body.displayName;
        }

        if (body.username) {
            const { data: existingProfile, error: existingProfileError } =
                await dbClient
                    .from("profiles")
                    .select("id")
                    .eq("username", body.username.toLowerCase())
                    .neq("id", user.id)
                    .maybeSingle();

            if (existingProfileError) throw existingProfileError;
            if (existingProfile) {
                throw new ApiError("This username is already taken.", 409);
            }
        }

        if (Object.keys(profileUpdates).length > 0) {
            const { error } = await dbClient
                .from("profiles")
                .update(profileUpdates)
                .eq("id", user.id);

            if (error) {
                if (error.code === "23505") {
                    throw new ApiError("This username is already taken.", 409);
                }

                throw error;
            }
        }

        if (body.email || body.password) {
            await updateAuthUser(request, user.id, {
                email: body.email,
                password: body.password,
            });
        }

        const { data: profile, error: profileError } = await dbClient
            .from("profiles")
            .select("username, display_name")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        return corsResponse(request, {
            account: {
                displayName: profile?.display_name ?? "",
                email: body.email ?? user.email ?? "",
                username: profile?.username ?? "",
            },
            message: body.email
                ? "Account updated. Confirm the new email from your inbox."
                : "Account updated.",
        });
    } catch (error) {
        return withCors(request, handleApiError(error));
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await requireUser(request);

        if (!hasSupabaseServiceRoleKey()) {
            throw new ApiError(
                "Account deletion requires SUPABASE_SERVICE_ROLE_KEY on the backend.",
                501,
            );
        }

        const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
        if (error) throw error;

        return corsResponse(request, { deleted: true });
    } catch (error) {
        return withCors(request, handleApiError(error));
    }
}

async function updateAuthUser(
    request: Request,
    userId: string,
    data: { email?: string; password?: string },
) {
    if (hasSupabaseServiceRoleKey()) {
        const { error } = await supabaseAdmin().auth.admin.updateUserById(
            userId,
            data,
        );
        if (error) throw error;
        return;
    }

    const token = parseBearerToken(request);
    if (!token) throw new ApiError("Missing Authorization bearer token.", 401);

    const { error } = await supabaseUserClient(request).auth.updateUser(data);
    if (error) throw error;
}

function corsHeaders(request: Request) {
    return {
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "PATCH, DELETE, OPTIONS",
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
