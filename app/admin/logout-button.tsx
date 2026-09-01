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

export const LogoutButton: FC = () => (
  <form action={signOut}>
    <Inner />
  </form>
);
