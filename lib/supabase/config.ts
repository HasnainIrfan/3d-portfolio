export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured: boolean = (() => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (SUPABASE_URL.includes("your-project")) return false;
  if (SUPABASE_ANON_KEY.startsWith("your-")) return false;
  try {
    new URL(SUPABASE_URL);
    return true;
  } catch {
    return false;
  }
})();
