/**
 * Admin session: a signed, stateless cookie.
 *
 * The cookie value is `base64url(payload).base64url(hmacSha256(payload))`. It
 * carries no secret of its own — the signature is what makes it unforgeable —
 * so it can be read without a database round trip, which is what lets `proxy.ts`
 * gate every /admin request cheaply.
 *
 * Deliberately not a JWT. A JWT would mean a dependency and an `alg` field that
 * has to be validated to avoid the `alg: none` class of bug; here there is only
 * ever one algorithm and the verifier does not read anything from the token
 * before checking the signature.
 *
 * Server-only. It reads `ADMIN_SESSION_SECRET`, which has no `NEXT_PUBLIC_`
 * prefix, so importing this from a Client Component fails the build rather than
 * leaking the key.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

export const ADMIN_COOKIE = "admin_session";

/** Eight hours: long enough to work through an inbox, short enough that a
 *  forgotten session on a shared machine expires the same day. */
const MAX_AGE_SECONDS = 60 * 60 * 8;

export interface AdminSession {
  /** The one admin's email, from ADMIN_EMAIL. There is no account id because
   *  there is no accounts table — see lib/admin/credentials.ts. */
  email: string;
  /** Unix seconds. */
  exp: number;
}

const getSecret = (): string => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // Refusing to run beats falling back to a default: a hardcoded fallback key
  // would mean anyone who has read this repository can mint a valid session.
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or shorter than 32 characters. " +
        "Generate one with: openssl rand -base64 48"
    );
  }
  return secret;
};

const signPayload = (encodedPayload: string): string =>
  createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

export const createSessionToken = (email: string): string => {
  const payload: AdminSession = {
    email,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
};

/**
 * Returns the session, or null for anything that is not a currently valid,
 * correctly signed token. Never throws on malformed input — a mangled cookie
 * should log you out, not produce a 500.
 */
export const verifySessionToken = (
  token: string | undefined | null
): AdminSession | null => {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = signPayload(encoded);
  const provided = Buffer.from(signature);
  const computed = Buffer.from(expected);

  // timingSafeEqual throws on a length mismatch, and comparing with === would
  // leak how much of the signature was correct through timing.
  if (provided.length !== computed.length) return null;
  if (!timingSafeEqual(provided, computed)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSession;

    if (typeof payload?.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

/** Cookie attributes shared by the set and clear paths, so they cannot drift
 *  apart — a delete only works if the attributes match the original set. */
const cookieOptions = {
  httpOnly: true,
  // Lax rather than Strict so following a link into /admin keeps you logged in;
  // there are no state-changing GET routes here for that to expose.
  sameSite: "lax",
  // Off on localhost, since a Secure cookie is dropped over plain http.
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export const setSessionCookie = async (token: string): Promise<void> => {
  (await cookies()).set(ADMIN_COOKIE, token, {
    ...cookieOptions,
    maxAge: MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = async (): Promise<void> => {
  (await cookies()).set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
};

/**
 * The session for the current request, memoized for the render pass so several
 * components can call it without repeating the HMAC.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
});
