/**
 * Gate for /admin, and the place Supabase sessions get refreshed.
 *
 * In Next.js 16 this file is `proxy.ts` — the former `middleware.ts`, renamed.
 * It runs on the Node.js runtime.
 *
 * Two jobs, and the first is easy to overlook:
 *
 *  1. **Refresh the session.** Supabase access tokens are short-lived. Server
 *     Components cannot write cookies, so if the refreshed pair is not written
 *     back here it is written back nowhere, and the admin gets logged out at
 *     seemingly random intervals. `supabase.auth.getUser()` below is what
 *     triggers that refresh — it is not a redundant call.
 *
 *  2. **Bounce anonymous requests** away from /admin before a page renders.
 *
 * It checks only whether a *session* exists, never whether the user is an
 * admin. A proxy runs on every matched request including prefetches, so a
 * database round trip here would be paid constantly; the admin-list check
 * belongs in the page, which does it through `getAdminState()`.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // No Supabase project on this deployment. Let everything through so /admin
  // can render its "not connected" panel — redirecting to a login page that
  // cannot work either would just be a loop with extra steps.
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        // Rebuilding the response from the mutated request is what makes the
        // refreshed cookies visible to the page rendering *after* this proxy,
        // not just to the browser on the next request.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Supabase supplies no-store headers alongside any auth cookie. A CDN
        // that cached this response would hand one admin's session to whoever
        // asked next.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Preserved so login can send them back where they were going.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirectResponse = NextResponse.redirect(url);
    // Carry over anything the refresh just set, or the new tokens are lost on
    // the redirect and the next request starts from an expired session again.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
