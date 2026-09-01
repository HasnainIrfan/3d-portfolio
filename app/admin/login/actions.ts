"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface LoginState {
  error?: string;
}

const INVALID = "Invalid email or password.";

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
    if (error?.status === 429) {
      return { error: "Too many attempts. Wait a few minutes and try again." };
    }
    return { error: INVALID };
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
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
