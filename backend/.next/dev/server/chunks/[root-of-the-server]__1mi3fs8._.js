module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appUrl",
    ()=>appUrl,
    "optionalEnv",
    ()=>optionalEnv,
    "requireEnv",
    ()=>requireEnv
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
let loadedFallbackEnv = false;
function requireEnv(name) {
    loadFallbackEnvFiles();
    const value = process.env[name];
    if (!value || isPlaceholderEnvValue(value)) {
        throw new Error(`${name} is not configured.`);
    }
    return value;
}
function optionalEnv(name) {
    loadFallbackEnvFiles();
    const value = process.env[name];
    if (!value || isPlaceholderEnvValue(value)) return undefined;
    return value;
}
function appUrl() {
    loadFallbackEnvFiles();
    return ("TURBOPACK compile-time value", "http://127.0.0.1:8080") ?? "http://127.0.0.1:8080";
}
function loadFallbackEnvFiles() {
    if (loadedFallbackEnv) return;
    loadedFallbackEnv = true;
    for (const path of [
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), ".env.local"),
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), ".env"),
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), "..", ".env.local"),
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), "..", ".env")
    ]){
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(path)) continue;
        const content = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(path, "utf8");
        for (const line of content.split(/\r?\n/)){
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const separator = trimmed.indexOf("=");
            if (separator === -1) continue;
            const key = trimmed.slice(0, separator).trim();
            const value = stripEnvQuotes(trimmed.slice(separator + 1).trim());
            if (key && process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    }
}
function stripEnvQuotes(value) {
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1);
    }
    return value;
}
function isPlaceholderEnvValue(value) {
    const normalized = stripEnvQuotes(value).trim().toLowerCase();
    return normalized === "" || normalized === "xxx" || normalized.startsWith("your-") || normalized.startsWith("your_") || normalized.includes("your-") || normalized.includes("your_");
}
}),
"[project]/src/lib/http.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "fail",
    ()=>fail,
    "handleApiError",
    ()=>handleApiError,
    "ok",
    ()=>ok,
    "parseBearerToken",
    ()=>parseBearerToken,
    "parseJson",
    ()=>parseJson
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
;
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
function ok(data, init) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, init);
}
function fail(message, status = 400) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message
    }, {
        status
    });
}
function parseBearerToken(request) {
    const header = request.headers.get("authorization");
    if (!header?.toLowerCase().startsWith("bearer ")) return null;
    return header.slice("bearer ".length).trim();
}
async function parseJson(request, schema) {
    const body = await request.json().catch(()=>null);
    return schema.parse(body);
}
function handleApiError(error) {
    if (error instanceof ApiError) {
        return fail(error.message, error.status);
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
        return fail(error.issues[0]?.message ?? "Invalid request.", 422);
    }
    return fail(error instanceof Error ? error.message : "Unexpected error.", 500);
}
}),
"[project]/src/lib/ageverif.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ageVerifRedirectUri",
    ()=>ageVerifRedirectUri,
    "createAgeVerifAuthorizationUrl",
    ()=>createAgeVerifAuthorizationUrl,
    "exchangeAgeVerifCode",
    ()=>exchangeAgeVerifCode,
    "fetchAgeVerifResources",
    ()=>fetchAgeVerifResources,
    "verifyAgeVerifState",
    ()=>verifyAgeVerifState
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
;
;
;
const DEFAULT_API_URL = "https://api.ageverif.com/v1/oauth2";
function createAgeVerifAuthorizationUrl(input) {
    const url = new URL(`${ageVerifBaseUrl()}/checker`);
    url.searchParams.set("client_id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("AGEVERIF_CLIENT_ID"));
    url.searchParams.set("redirect_uri", ageVerifRedirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "read");
    url.searchParams.set("state", signAgeVerifState(input.userId));
    const language = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("AGEVERIF_LANGUAGE");
    if (language) url.searchParams.set("language", language);
    const challenges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("AGEVERIF_CHALLENGES");
    if (challenges) url.searchParams.set("challenges", challenges);
    return url.toString();
}
async function exchangeAgeVerifCode(input) {
    const response = await fetch(`${ageVerifBaseUrl()}/token`, {
        method: "POST",
        headers: {
            authorization: `Basic ${Buffer.from(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("AGEVERIF_CLIENT_ID")}:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("AGEVERIF_CLIENT_SECRET")}`).toString("base64")}`,
            "content-type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code: input.code,
            grant_type: "authorization_code",
            redirect_uri: ageVerifRedirectUri()
        })
    });
    const payload = await response.json().catch(()=>({}));
    if (!response.ok || !payload.access_token) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"](payload.error_description ?? payload.error ?? "Could not exchange AgeVerif authorization code.", 502);
    }
    return payload;
}
async function fetchAgeVerifResources(accessToken) {
    const response = await fetch(`${ageVerifBaseUrl()}/resources`, {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    });
    const payload = await response.json().catch(()=>({}));
    if (!response.ok) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Could not fetch AgeVerif resources.", 502);
    }
    return payload;
}
function verifyAgeVerifState(state) {
    const [payloadValue, signature] = state.split(".");
    if (!payloadValue || !signature) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Invalid AgeVerif state.", 400);
    }
    const expected = hmac(payloadValue);
    if (!safeEqual(expected, signature)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Invalid AgeVerif state.", 400);
    }
    const payload = JSON.parse(Buffer.from(payloadValue, "base64url").toString("utf8"));
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Expired AgeVerif state.", 400);
    }
    return payload;
}
function ageVerifRedirectUri() {
    const configured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("AGEVERIF_REDIRECT_URI");
    if (configured) return configured;
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appUrl"])().replace(/\/$/, "")}/api/creator-applications/verification/callback`;
}
function signAgeVerifState(userId) {
    const payload = {
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
        nonce: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex"),
        userId
    };
    const payloadValue = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${payloadValue}.${hmac(payloadValue)}`;
}
function hmac(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("AGEVERIF_STATE_SECRET")).update(value).digest("base64url");
}
function ageVerifBaseUrl() {
    return ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("AGEVERIF_API_URL") ?? DEFAULT_API_URL).replace(/\/$/, "");
}
function safeEqual(left, right) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(leftBuffer, rightBuffer);
}
}),
"[project]/src/lib/supabase-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasSupabaseServiceRoleKey",
    ()=>hasSupabaseServiceRoleKey,
    "requireUser",
    ()=>requireUser,
    "supabaseAdmin",
    ()=>supabaseAdmin,
    "supabaseUserClient",
    ()=>supabaseUserClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
;
;
;
let adminClient = null;
function supabaseAdmin() {
    if (!adminClient) {
        adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("SUPABASE_URL"), requireSupabaseServerKey(), {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return adminClient;
}
function hasSupabaseServiceRoleKey() {
    return Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("SUPABASE_SERVICE_ROLE_KEY"));
}
function supabaseUserClient(request) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBearerToken"])(request);
    if (!token) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Missing Authorization bearer token.", 401);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("SUPABASE_URL"), requireSupabasePublicKey(), {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
}
async function requireUser(request) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBearerToken"])(request);
    if (!token) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("Missing Authorization bearer token.", 401);
    const client = hasSupabaseServiceRoleKey() ? supabaseAdmin() : supabaseUserClient(request);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"](error?.message ?? "Invalid session.", 401);
    }
    return data.user;
}
function requireSupabaseServerKey() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("SUPABASE_SERVICE_ROLE_KEY") ?? requireSupabasePublicKey();
}
function requireSupabasePublicKey() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("SUPABASE_PUBLISHABLE_KEY") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optionalEnv"])("VITE_SUPABASE_PUBLISHABLE_KEY") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("SUPABASE_SERVICE_ROLE_KEY");
}
}),
"[project]/src/app/api/creator-applications/verification/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ageverif$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ageverif.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-admin.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = "nodejs";
async function OPTIONS(request) {
    return corsResponse(request, null, {
        status: 204
    });
}
async function POST(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(request);
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasSupabaseServiceRoleKey"])() ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseUserClient"])(request);
        const { data: profile } = await db.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle();
        const username = profile?.username ?? user.email?.split("@")[0] ?? user.id;
        const verificationUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ageverif$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgeVerifAuthorizationUrl"])({
            userId: user.id
        });
        const { data, error } = await db.from("creator_applications").upsert({
            bio: "Identity verification started.",
            category: "Pending verification",
            display_name: profile?.display_name ?? username,
            handle: username,
            identity_verification_status: "created",
            identity_verification_url: verificationUrl,
            identity_verification_payload: {
                provider: "ageverif",
                startedAt: new Date().toISOString()
            },
            payout_email: user.email ?? `${user.id}@fanly.local`,
            status: "pending",
            user_id: user.id
        }, {
            onConflict: "user_id"
        }).select("*").single();
        if (error) throw error;
        return corsResponse(request, {
            application: data,
            verificationUrl
        }, {
            status: 201
        });
    } catch (error) {
        return withCors(request, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleApiError"])(error));
    }
}
function corsHeaders(request) {
    return {
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-origin": request.headers.get("origin") ?? "*",
        vary: "Origin"
    };
}
function corsResponse(request, body, init) {
    if (body === null) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            ...init,
            headers: {
                ...corsHeaders(request),
                ...init?.headers
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(body, {
        ...init,
        headers: {
            ...corsHeaders(request),
            ...init?.headers
        }
    });
}
function withCors(request, response) {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(request))){
        headers.set(key, value);
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](response.body, {
        headers,
        status: response.status,
        statusText: response.statusText
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1mi3fs8._.js.map