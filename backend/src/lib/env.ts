import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let loadedFallbackEnv = false;

export function requireEnv(name: string) {
    loadFallbackEnvFiles();
    const value = process.env[name];
    if (!value || isPlaceholderEnvValue(value)) {
        throw new Error(`${name} is not configured.`);
    }
    return value;
}

export function optionalEnv(name: string) {
    loadFallbackEnvFiles();
    const value = process.env[name];
    if (!value || isPlaceholderEnvValue(value)) return undefined;
    return value;
}

export function appUrl() {
    loadFallbackEnvFiles();
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:8080";
}

function loadFallbackEnvFiles() {
    if (loadedFallbackEnv) return;
    loadedFallbackEnv = true;

    for (const path of [
        resolve(process.cwd(), ".env.local"),
        resolve(process.cwd(), ".env"),
        resolve(process.cwd(), "..", ".env.local"),
        resolve(process.cwd(), "..", ".env"),
    ]) {
        if (!existsSync(path)) continue;

        const content = readFileSync(path, "utf8");
        for (const line of content.split(/\r?\n/)) {
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

function stripEnvQuotes(value: string) {
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

function isPlaceholderEnvValue(value: string) {
    const normalized = stripEnvQuotes(value).trim().toLowerCase();

    return (
        normalized === "" ||
        normalized === "xxx" ||
        normalized.startsWith("your-") ||
        normalized.startsWith("your_") ||
        normalized.includes("your-") ||
        normalized.includes("your_")
    );
}
