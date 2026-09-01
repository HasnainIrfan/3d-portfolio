"use server";

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

  revalidatePath("/admin");
  return { ok: true };
};
