import { ok } from "../../../lib/http";

export const runtime = "nodejs";

export async function GET() {
    return ok({
        ok: true,
        service: "naked-profile-backend",
        time: new Date().toISOString(),
    });
}
