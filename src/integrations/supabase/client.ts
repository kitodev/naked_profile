import { createClient } from "@supabase/supabase-js";

type RuntimeClientConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const runtimeConfig =
  typeof window === "undefined"
    ? undefined
    : (window as Window & { __APP_CONFIG__?: RuntimeClientConfig })
        .__APP_CONFIG__;

const supabaseUrl =
  runtimeConfig?.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  runtimeConfig?.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const fallbackSupabaseUrl = "https://example.supabase.co";
const fallbackSupabaseAnonKey = "missing-supabase-publishable-key";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
