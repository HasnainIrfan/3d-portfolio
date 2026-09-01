/**
 * Supabase connection details, and the question every other module asks first:
 * is this deployment connected to a database at all?
 *
 * Both variables are `NEXT_PUBLIC_` and both are safe in a browser bundle. The
 * anon key is not a secret — it is a public identifier, and row-level security
 * is what decides who may read what. There is deliberately no service-role key
 * anywhere in this project; see supabase/migrations/0002_admin_auth.sql for the
 * policies that replaced it.
 *
 * Nothing here throws. A fork of this repo should run, build and deploy with an
 * empty `.env` — the portfolio is the product, the database is optional. Callers
 * check `isSupabaseConfigured` and degrade, rather than catching an exception.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

/**
 * True only when both values are present *and* the URL parses. A half-filled
 * `.env` — a URL with no key, or a placeholder left in from `.env.example` —
 * is treated as "not connected" rather than allowed to fail later at the first
 * query, where the error would be much harder to read.
 */
export const isSupabaseConfigured: boolean = (() => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  // `.env.example` ships placeholders. Catching them here means an unfinished
  // setup shows the "not connected" panel instead of a DNS failure.
  if (SUPABASE_URL.includes("your-project")) return false;
  if (SUPABASE_ANON_KEY.startsWith("your-")) return false;
  try {
    new URL(SUPABASE_URL);
    return true;
  } catch {
    return false;
  }
})();
