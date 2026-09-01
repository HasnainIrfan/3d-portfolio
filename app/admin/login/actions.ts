"use server";

/**
 * Sign-in and sign-out, as Server Actions.
 *
 * These replaced /api/admin/login and /api/admin/logout. A Server Action can
 * set cookies just as a Route Handler can, and doing it this way means the
 * login form works with JavaScript disabled and there is no fetch/JSON layer
 * between the form and the check.
 *
 * There is no rate-limiting code here any more. The previous version counted
 * failures in a module-level Map, which on a serverless host meant each
 * instance counted separately. Supabase enforces its own sign-in limits at the
 * auth server, where the count is actually shared.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface LoginState {
  error?: string;
}

/** The same text for an unknown address and a wrong password, so the response
 *  cannot be used to find out which addresses have accounts. */
const INVALID = "Invalid email or password.";

/**
 * `next` arrives from the query string, so it is untrusted: only a same-site
 * absolute path is allowed through. Without the `//` check this is an open
 * redirect that lands a freshly signed-in admin on someone else's origin.
 */
const safeRedirect = (next: string | null): string =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

export const signIn = async (
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> => {
  if (!isSupabaseConfigured) {
    return {
      error:
        "This deployment has no Supabase project connected, so there is " +
        "nothing to sign in to. See docs/admin.md.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(String(formData.get("next") ?? "") || null);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  // Bounded before anything else. An unbounded password is a free way to make
  // the auth server hash megabytes on your behalf.
  if (email.length > 200 || password.length > 200) {
    return { error: INVALID };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Could not reach the database." };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Supabase returns 429 with its own message once its rate limit trips;
    // that one is worth passing through, since "invalid password" would be a
    // lie and would have the admin retrying forever.
    if (error?.status === 429) {
      return { error: "Too many attempts. Wait a few minutes and try again." };
    }
    return { error: INVALID };
  }

  // Authenticated, but that is only half the check. A Supabase project can have
  // users who were never meant to see this page — anyone who signed up, or an
  // account created for something else entirely.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    // Drop the session again. Leaving it in place would mean a non-admin walks
    // around with a valid cookie for a site that has nothing else behind login.
    await supabase.auth.signOut();
    return {
      error:
        "That account is not an admin on this project. Add it with " +
        "select public.grant_admin('you@example.com'); in the SQL editor.",
    };
  }

  revalidatePath("/admin", "layout");
  redirect(next);
};

export const signOut = async (): Promise<void> => {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
};
