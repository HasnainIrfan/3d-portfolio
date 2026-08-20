/**
 * The single admin credential.
 *
 * There is exactly one admin, so the account lives in the environment rather
 * than in a table: no admin_users row to seed, no bcrypt round trip, nothing to
 * keep in sync between the database and the deployment. The only table this
 * project has is contact_submissions.
 *
 * Server-only — neither variable carries a `NEXT_PUBLIC_` prefix, so importing
 * this from a Client Component fails the build instead of shipping the password
 * to browsers.
 */

import { timingSafeEqual } from "node:crypto";

export type CredentialResult =
  | { status: "ok"; email: string }
  | { status: "invalid" }
  /** ADMIN_EMAIL / ADMIN_PASSWORD are not set on this deployment. */
  | { status: "not-configured" };

/** Compares without leaking, through timing, how much of the value matched.
 *  Both sides are hashed to a fixed length first so the comparison is also
 *  independent of the *length* of either string. */
const constantTimeEquals = (a: string, b: string): boolean => {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  // timingSafeEqual throws on a length mismatch, so pad to a common length and
  // fold the length difference into the result instead of returning early.
  const length = Math.max(left.length, right.length);
  const paddedLeft = Buffer.alloc(length);
  const paddedRight = Buffer.alloc(length);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
};

export const verifyCredentials = (
  email: string,
  password: string
): CredentialResult => {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must both be set for /admin sign-in."
    );
    return { status: "not-configured" };
  }

  // Email is matched case-insensitively — it identifies the one account, it is
  // not a secret. The password is compared exactly.
  const emailMatches = constantTimeEquals(
    email.trim().toLowerCase(),
    expectedEmail.toLowerCase()
  );
  const passwordMatches = constantTimeEquals(password, expectedPassword);

  // Both are evaluated before branching so a wrong email costs the same as a
  // wrong password.
  return emailMatches && passwordMatches
    ? { status: "ok", email: expectedEmail }
    : { status: "invalid" };
};
