import { createClient } from "@supabase/supabase-js";

const defaultSupabaseUrl = "https://nessqcrpkbtaspiauoae.supabase.co";
const defaultSupabasePublishableKey = "sb_publishable_VZd4atyzs6LSlR0wLdi67w_EwUH0M6f";

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  defaultSupabasePublishableKey;

const isValidSupabaseUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const supabaseUrl = isValidSupabaseUrl(configuredSupabaseUrl)
  ? configuredSupabaseUrl
  : "https://placeholder-project.supabase.co";

export const isSupabaseConfigured = Boolean(
  isValidSupabaseUrl(configuredSupabaseUrl) &&
  supabaseAnonKey && 
  !configuredSupabaseUrl.includes("your-project-ref")
);

// Fallback dummy client for build time / local development before keys are added
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "placeholder-anon-key"
);
