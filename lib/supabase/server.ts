/**
 * The request-scoped Supabase client.
 *
 * Every query in this project goes through here, and every query runs as
 * whoever is making the request: an anonymous visitor posting the contact form,
 * or a signed-in admin reading it. There is no privileged client that bypasses
 * row-level security, which is why there is no server-only secret to leak.
 *
 * `createServerClient` must be given both `getAll` and `setAll`. Supabase
 * rotates the access token part-way through its lifetime, and `setAll` is how
 * the refreshed pair gets written back to the browser — without it you get
 * random logouts that are very hard to trace back to their cause.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Returns null — never throws — when the deployment has no Supabase project.
 * Callers render a setup state instead of a stack trace.
 */
export const createClient = async (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // The second argument is a set of no-store response headers. They can
      // only be applied where there is a response object to apply them to, so
      // `proxy.ts` sets them; a Server Component has no way to and ignores them.
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Expected and harmless:
          // `proxy.ts` runs first on every /admin request and has already
          // refreshed the session on the response.
        }
      },
    },
  });
};
