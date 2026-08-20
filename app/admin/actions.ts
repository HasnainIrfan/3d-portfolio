"use server";

/**
 * Server Actions for the admin area.
 *
 * Every export here is reachable by a direct POST from anywhere — Next.js
 * exposes Server Actions as endpoints, and `proxy.ts` only matches `/admin/*`
 * page requests, not the action endpoint. So the session check inside each
 * function is not a second line of defence, it is the only one.
 */

import { revalidatePath } from "next/cache";
import { deleteSubmission } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

export const deleteSubmissionAction = async (
  id: string
): Promise<DeleteResult> => {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Not signed in." };

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
