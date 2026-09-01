"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FC } from "react";
import { deleteSubmissionAction } from "./actions";

export const DeleteButton: FC<{ id: string; name: string }> = ({ id, name }) => {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSubmissionAction(id);
      if (!result.ok) {
        setError(result.error ?? "Could not delete.");
        setArmed(false);
        return;
      }
      router.refresh();
    });
  };

  if (!armed) {
    return (
      <div className="flex items-center gap-3">
        {error && (
          <span role="alert" className="text-xs text-coral">
            {error}
          </span>
        )}
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="text-xs text-neutral-500 transition-colors hover:text-coral"
          aria-label={`Delete submission from ${name}`}
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-400">Delete permanently?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-full border border-coral/40 bg-coral/10 px-3 py-1 text-xs text-coral transition-colors hover:bg-coral/20 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={pending}
        className="text-xs text-neutral-500 hover:text-neutral-300 disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
};
