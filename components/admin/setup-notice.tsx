import { type FC } from "react";

interface SetupNoticeProps {
  variant?: "no-project" | "no-schema";
}

export const SetupNotice: FC<SetupNoticeProps> = ({
  variant = "no-project",
}) => (
  <div className="space-y-4 text-sm">
    <div className="flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full bg-sand" />
      <h2 className="font-semibold text-white">
        {variant === "no-schema"
          ? "Migrations not run yet"
          : "Database not connected"}
      </h2>
    </div>

    {variant === "no-schema" ? (
      <>
        <p className="text-neutral-400">
          The Supabase project is connected, but it has no{" "}
          <code className="text-neutral-300">admin_users</code> table, so there
          is no way to say who is allowed in here.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-neutral-400 marker:text-neutral-600">
          <li>
            Run{" "}
            <code className="text-neutral-300">
              supabase/migrations/0001_init.sql
            </code>{" "}
            in the SQL editor.
          </li>
          <li>
            It creates your admin account too. Change the placeholder login at
            the bottom of that file first.
          </li>
        </ol>
      </>
    ) : (
      <>
        <p className="text-neutral-400">
          The contact form and this inbox need a Supabase project. The rest of
          the site runs fine without one. This page is the only thing waiting.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-neutral-400 marker:text-neutral-600">
          <li>
            Create a project at{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer noopener"
              className="text-coral hover:underline"
            >
              supabase.com
            </a>
            .
          </li>
          <li>
            Run{" "}
            <code className="text-neutral-300">
              supabase/migrations/0001_init.sql
            </code>{" "}
            in the SQL editor.
          </li>
          <li>
            Set{" "}
            <code className="text-neutral-300">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="text-neutral-300">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            , then redeploy.
          </li>
        </ol>
      </>
    )}

    <p className="text-xs text-neutral-500">
      Full walkthrough in <code>docs/admin.md</code>.
    </p>
  </div>
);
