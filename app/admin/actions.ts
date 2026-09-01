"use server";

/**
 * Server Actions for the admin area.
 *
 * Every export here is reachable by a direct POST from anywhere — Next.js
 * exposes Server Actions as endpoints, so the `getAdminUser()` check inside
 * each function is doing real work, not repeating something the proxy already
 * did. The matching RLS policy in the database is the backstop underneath it.
 */

import { revalidatePath } from "next/cache";
import { deleteSubmission } from "@/lib/admin/data";
import { getAdminUser } from "@/lib/admin/auth";

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

export const deleteSubmissionAction = async (
  id: string
): Promise<DeleteResult> => {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not signed in as an admin." };

  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Missing submission id." };
  }

  try {
    await deleteSubmission(id);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not delete.",
    };
  }

  // Re-renders the list and the counts above it. The page is already
  // force-dynamic, but the client router caches the RSC payload, so without
  // this the deleted card stays on screen until a hard reload.
  revalidatePath("/admin");
  return { ok: true };
};
