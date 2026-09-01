import { type FC } from "react";
import { LogoutButton } from "@/app/admin/logout-button";

/**
 * A real Supabase user with no `admin_users` row. Redirecting to /admin/login
 * would bounce straight back here — they *are* signed in — so this is a dead
 * end with a way out rather than a loop.
 */
export const NotAdminNotice: FC<{ email: string }> = ({ email }) => (
  <div className="space-y-4 text-sm">
    <h1 className="text-lg font-semibold text-white">Not an admin</h1>
    <p className="text-neutral-400">
      You are signed in as <span className="text-neutral-200">{email}</span>, but
      that account is not on this project&rsquo;s admin list, so there is nothing
      here for it to show.
    </p>
    <p className="text-neutral-400">
      Grant it access by running{" "}
      <code className="text-neutral-300">
        select public.grant_admin(&apos;{email}&apos;);
      </code>{" "}
      in the Supabase SQL editor.
    </p>
    <LogoutButton />
  </div>
);
