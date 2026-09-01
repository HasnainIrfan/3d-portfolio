/**
 * Who is allowed into /admin.
 *
 * Two separate questions, and conflating them is the classic mistake:
 *
 *   1. Are you signed in?   Supabase Auth answers this.
 *   2. Are you an admin?    `public.admin_users` answers this.
 *
 * Anyone with a Supabase account on this project passes (1). Only rows in
 * `admin_users` pass (2), and that table can only be written from the SQL
 * editor — see supabase/migrations/0001_init.sql. So a stray signup
 * gets a session and still sees nothing.
 *
 * This replaced an ADMIN_EMAIL/ADMIN_PASSWORD pair kept in the environment.
 * Supabase Auth brings bcrypt hashing, refresh-token rotation, server-side rate
 * limiting and password reset with it, none of which the old scheme had, and it
 * removes three secrets from the deployment.
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
}

/** PostgREST reports an absent table through a code, and Supabase's schema
 *  cache through a different one. Both mean "run the migrations". */
const isMissingTable = (error: { code?: string; message?: string }): boolean =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  /relation .* does not exist/i.test(error.message ?? "") ||
  /could not find the table/i.test(error.message ?? "");

export type AdminState =
  /** Signed in and on the admin list. */
  | { status: "admin"; user: AdminUser }
  /** No session, or the session is no longer valid. */
  | { status: "signed-out" }
  /** A real Supabase user who is not in `admin_users`. */
  | { status: "not-admin"; email: string }
  /** Connected to a project where the migrations have not been run. */
  | { status: "schema-missing" }
  /** This deployment has no Supabase project connected. */
  | { status: "not-configured" };

/**
 * The caller's admin state for the current request, memoized for the render
 * pass so a layout, a page and an action can each ask without repeating the
 * round trip.
 *
 * Uses `getUser()`, not `getSession()`. `getSession()` decodes whatever is in
 * the cookie and trusts it; `getUser()` revalidates the token against the auth
 * server, which is the difference between a check and a formality.
 */
export const getAdminState = cache(async (): Promise<AdminState> => {
  const supabase = await createClient();
  if (!supabase) return { status: "not-configured" };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { status: "signed-out" };

  // RLS on admin_users only exposes the row to an admin, so this returns either
  // the caller's own row or nothing at all. `maybeSingle` because "no row" is a
  // normal answer here, not an error.
  const { data: adminRow, error: lookupError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Distinguished from "not an admin" on purpose. Connecting a project and
  // forgetting to run 0002 is the single most likely setup mistake, and
  // "you are not an admin" would send you looking in exactly the wrong place.
  if (lookupError && isMissingTable(lookupError)) {
    return { status: "schema-missing" };
  }

  if (!adminRow) {
    return { status: "not-admin", email: user.email ?? "unknown" };
  }

  return {
    status: "admin",
    user: { id: user.id, email: user.email ?? "unknown" },
  };
});

/** Narrow helper for the many call sites that only care about the yes/no. */
export const getAdminUser = async (): Promise<AdminUser | null> => {
  const state = await getAdminState();
  return state.status === "admin" ? state.user : null;
};
