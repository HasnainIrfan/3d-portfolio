import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
}

const isMissingTable = (error: { code?: string; message?: string }): boolean =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  /relation .* does not exist/i.test(error.message ?? "") ||
  /could not find the table/i.test(error.message ?? "");

export type AdminState =
  | { status: "admin"; user: AdminUser }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string }
  | { status: "schema-missing" }
  | { status: "not-configured" };

export const getAdminState = cache(async (): Promise<AdminState> => {
  const supabase = await createClient();
  if (!supabase) return { status: "not-configured" };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { status: "signed-out" };

  const { data: adminRow, error: lookupError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

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

export const getAdminUser = async (): Promise<AdminUser | null> => {
  const state = await getAdminState();
  return state.status === "admin" ? state.user : null;
};
