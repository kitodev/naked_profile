import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { appUrl, optionalEnv, requireEnv } from "./env";
import { ApiError } from "./http";

type AgeVerifTokenResponse = {
    access_token?: string;
    error?: string;
    error_description?: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
};

export type AgeVerifResources = {
    resources?: {
        age_threshold?: number;
        assurance_level?: string;
        country?: string;
        country_subdivision?: string | null;
        expires_at?: number;
        expires_in?: number;
        reused?: boolean;
        uid?: string;
        verified?: boolean;
    };
};

type AgeVerifStatePayload = {
    exp: number;
    nonce: string;
    userId: string;
};

const DEFAULT_API_URL = "https://api.ageverif.com/v1/oauth2";

export function createAgeVerifAuthorizationUrl(input: { userId: string }) {
    const url = new URL(`${ageVerifBaseUrl()}/checker`);
    url.searchParams.set("client_id", requireEnv("AGEVERIF_CLIENT_ID"));
    url.searchParams.set("redirect_uri", ageVerifRedirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "read");
    url.searchParams.set("state", signAgeVerifState(input.userId));

    const language = optionalEnv("AGEVERIF_LANGUAGE");
    if (language) url.searchParams.set("language", language);

    const challenges = optionalEnv("AGEVERIF_CHALLENGES");
    if (challenges) url.searchParams.set("challenges", challenges);

    return url.toString();
}

export async function exchangeAgeVerifCode(input: { code: string }) {
    const response = await fetch(`${ageVerifBaseUrl()}/token`, {
        method: "POST",
        headers: {
            authorization: `Basic ${Buffer.from(
                `${requireEnv("AGEVERIF_CLIENT_ID")}:${requireEnv(
                    "AGEVERIF_CLIENT_SECRET",
                )}`,
            ).toString("base64")}`,
            "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code: input.code,
            grant_type: "authorization_code",
            redirect_uri: ageVerifRedirectUri(),
        }),
    });

    const payload = (await response
        .json()
        .catch(() => ({}))) as AgeVerifTokenResponse;

    if (!response.ok || !payload.access_token) {
        throw new ApiError(
            payload.error_description ??
                payload.error ??
                "Could not exchange AgeVerif authorization code.",
            502,
        );
    }

    return payload;
}

export async function fetchAgeVerifResources(accessToken: string) {
    const response = await fetch(`${ageVerifBaseUrl()}/resources`, {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });

    const payload = (await response
        .json()
        .catch(() => ({}))) as AgeVerifResources;

    if (!response.ok) {
        throw new ApiError("Could not fetch AgeVerif resources.", 502);
    }

    return payload;
}

export function verifyAgeVerifState(state: string) {
    const [payloadValue, signature] = state.split(".");
    if (!payloadValue || !signature) {
        throw new ApiError("Invalid AgeVerif state.", 400);
    }

    const expected = hmac(payloadValue);
    if (!safeEqual(expected, signature)) {
        throw new ApiError("Invalid AgeVerif state.", 400);
    }

    const payload = JSON.parse(
        Buffer.from(payloadValue, "base64url").toString("utf8"),
    ) as AgeVerifStatePayload;

    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
        throw new ApiError("Expired AgeVerif state.", 400);
    }

    return payload;
}

export function ageVerifRedirectUri() {
    const configured = optionalEnv("AGEVERIF_REDIRECT_URI");
    if (configured) return configured;

    return `${appUrl().replace(
        /\/$/,
        "",
    )}/api/creator-applications/verification/callback`;
}

function signAgeVerifState(userId: string) {
    const payload: AgeVerifStatePayload = {
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
        nonce: randomBytes(16).toString("hex"),
        userId,
    };
    const payloadValue = Buffer.from(JSON.stringify(payload)).toString(
        "base64url",
    );

    return `${payloadValue}.${hmac(payloadValue)}`;
}

function hmac(value: string) {
    return createHmac("sha256", requireEnv("AGEVERIF_STATE_SECRET"))
        .update(value)
        .digest("base64url");
}

function ageVerifBaseUrl() {
    return (optionalEnv("AGEVERIF_API_URL") ?? DEFAULT_API_URL).replace(
        /\/$/,
        "",
    );
}

function safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return (
        leftBuffer.length === rightBuffer.length &&
        timingSafeEqual(leftBuffer, rightBuffer)
    );
}
