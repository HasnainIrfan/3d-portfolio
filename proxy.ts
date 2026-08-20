/**
 * Gate for /admin.
 *
 * In Next.js 16 this file is `proxy.ts` — the former `middleware.ts`, renamed.
 * It runs on the Node.js runtime, so `node:crypto` is available and the
 * signature can be checked here rather than merely testing that a cookie
 * exists.
 *
 * This is still only the first of two checks. Because a proxy runs on every
 * matched request including prefetches, it does no database work, which means
 * it can confirm a session is authentic but not that the account still exists.
 * The pages themselves re-verify through `getAdminSession()` before reading
 * anything — see app/admin/page.tsx.
 */

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  let session = null;
  try {
    session = verifySessionToken(token);
  } catch {
    // ADMIN_SESSION_SECRET missing or too short. Treat as signed out here and
    // let the login route surface the real configuration error.
    session = null;
  }

  const isLoginPage = pathname === "/admin/login";

  if (!session && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Preserved so the login redirect can send you back where you were headed.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only the admin pages. The login API is deliberately excluded — it is how
  // you get a session in the first place.
  matcher: ["/admin/:path*"],
};
