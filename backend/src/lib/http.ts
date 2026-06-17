import { NextResponse } from "next/server";
import { z } from "zod";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json(data, init);
}

export function fail(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export function parseBearerToken(request: Request) {
    const header = request.headers.get("authorization");
    if (!header?.toLowerCase().startsWith("bearer ")) return null;
    return header.slice("bearer ".length).trim();
}

export async function parseJson<T>(
    request: Request,
    schema: z.Schema<T>,
): Promise<T> {
    const body = await request.json().catch(() => null);
    return schema.parse(body);
}

export function handleApiError(error: unknown) {
    if (error instanceof ApiError) {
        return fail(error.message, error.status);
    }

    if (error instanceof z.ZodError) {
        return fail(error.issues[0]?.message ?? "Invalid request.", 422);
    }

    return fail(
        error instanceof Error ? error.message : "Unexpected error.",
        500,
    );
}
