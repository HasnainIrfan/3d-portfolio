import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/admin/credentials";
import {
  clearLoginAttempts,
  isLoginThrottled,
  recordFailedLogin,
} from "@/lib/admin/throttle";
import { createSessionToken, setSessionCookie } from "@/lib/admin/session";

export const runtime = "nodejs";
// Never cache an auth endpoint.
export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  password?: string;
}

/** The same message for a wrong address and a wrong password, so the response
 *  cannot be used to learn which of the two was right. */
const INVALID = "Invalid email or password.";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  // Bounded before any comparison work — an unbounded password is a free way to
  // make the server hash and copy megabytes per request.
  if (email.length > 200 || password.length > 200) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || null;

  if (isLoginThrottled(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const result = verifyCredentials(email, password);

  if (result.status === "not-configured") {
    return NextResponse.json(
      {
        error:
          "Admin login is not set up yet. Set ADMIN_EMAIL and ADMIN_PASSWORD " +
          "in the environment — see docs/admin.md.",
      },
      { status: 503 }
    );
  }

  if (result.status === "invalid") {
    // Only a real credential failure counts toward the throttle; a
    // misconfigured deployment must not lock the admin out once it is fixed.
    recordFailedLogin(ip);
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  try {
    await setSessionCookie(createSessionToken(result.email));
  } catch (secretError) {
    // Thrown when ADMIN_SESSION_SECRET is missing or too short. Surfaced as a
    // 500 rather than a login failure, because the credentials were correct.
    console.error("Could not issue admin session:", secretError);
    return NextResponse.json(
      { error: "Server is not configured for sign-in." },
      { status: 500 }
    );
  }

  clearLoginAttempts(ip);

  return NextResponse.json({ ok: true }, { status: 200 });
}
