import Link from "next/link";
import { type FC } from "react";
import { type AdminSearchProps } from "@/types/admin-types";

export const AdminSearch: FC<AdminSearchProps> = ({ search }) => (
  <form method="get" action="/admin" className="mt-8 flex gap-3">
    <input
      type="search"
      name="q"
      defaultValue={search}
      placeholder="Search name, email or message…"
      aria-label="Search submissions"
      className="field-input field-input-focus mt-0 flex-1"
    />
    <button type="submit" className="btn-ghost px-5 py-2 text-sm">
      <span>Search</span>
    </button>
    {search && (
      <Link href="/admin" className="btn-ghost px-5 py-2 text-sm">
        <span>Clear</span>
      </Link>
    )}
  </form>
);
