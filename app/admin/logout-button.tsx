"use client";

import { useFormStatus } from "react-dom";
import { type FC } from "react";
import { signOut } from "./login/actions";

const Inner: FC = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-ghost px-4 py-2 text-xs disabled:opacity-60"
    >
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
};

/**
 * A real form POST rather than a fetch. Sign-out clears a cookie and redirects,
 * both of which the Server Action does on the server — so there is no response
 * to interpret on the client and no router refresh to remember.
 */
export const LogoutButton: FC = () => (
  <form action={signOut}>
    <Inner />
  </form>
);
