"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

export const LogoutButton: FC = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="btn-ghost px-4 py-2 text-xs disabled:opacity-60"
    >
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
};
