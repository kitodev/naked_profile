import { NextResponse } from "next/server";
import {
    exchangeAgeVerifCode,
    fetchAgeVerifResources,
    verifyAgeVerifState,
} from "../../../../../lib/ageverif";
import { appUrl } from "../../../../../lib/env";
import { handleApiError } from "../../../../../lib/http";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
            return redirectToCreatorPage("error", error);
        }

        if (!code || !state) {
            return redirectToCreatorPage(
                "error",
                "Missing AgeVerif callback parameters.",
            );
        }

        const payload = verifyAgeVerifState(state);
        const token = await exchangeAgeVerifCode({ code });
        const resources = await fetchAgeVerifResources(token.access_token!);
        const verified = resources.resources?.verified === true;

        const { error: updateError } = await supabaseAdmin()
            .from("creator_applications")
            .update({
                ageverif_resource_uid: resources.resources?.uid ?? null,
                identity_verification_payload: {
                    provider: "ageverif",
                    resources,
                    token: {
                        expires_at: token.expires_at,
                        expires_in: token.expires_in,
                        token_type: token.token_type,
                    },
                    verified,
                },
                identity_verification_status: verified
                    ? "completed"
                    : "not_verified",
                identity_verified_at: verified
                    ? new Date().toISOString()
                    : null,
            })
            .eq("user_id", payload.userId);

        if (updateError) throw updateError;

        return redirectToCreatorPage(verified ? "verified" : "not_verified");
    } catch (error) {
        const response = handleApiError(error);
        const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
        };

        return redirectToCreatorPage(
            "error",
            payload.error ?? "AgeVerif verification failed.",
        );
    }
}

function redirectToCreatorPage(status: string, message?: string) {
    const redirectUrl = new URL(
        `${appUrl().replace(/\/$/, "")}/become-creator`,
    );
    redirectUrl.searchParams.set("ageverif", status);
    if (message) redirectUrl.searchParams.set("message", message);

    return NextResponse.redirect(redirectUrl);
}
