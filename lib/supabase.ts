import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
