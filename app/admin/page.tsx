import { redirect } from "next/navigation";
import Link from "next/link";
import { type FC } from "react";
import {
  listSubmissions,
  getSubmissionStats,
  PAGE_SIZE,
  type ContactSubmission,
} from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { LogoutButton } from "./logout-button";
import { DeleteButton } from "./delete-button";

// Reads a signed cookie and live data, so it must never be prerendered or
// cached — a cached copy would be one visitor's data served to the next.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed);
};

const StatCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="glass p-5">
    <p className="text-eyebrow">{label}</p>
    <p className="mt-2 text-3xl font-extrabold text-gradient">{value}</p>
  </div>
);

const SubmissionRow: FC<{ row: ContactSubmission }> = ({ row }) => (
  <article className="glass gradient-border p-5">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-white">
          {row.name}
        </h3>
        <a
          href={`mailto:${row.email}`}
          className="text-sm text-coral hover:underline break-all"
        >
          {row.email}
        </a>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {row.budget && (
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300">
            {row.budget}
          </span>
        )}
        <time
          dateTime={row.created_at}
          className="text-xs text-neutral-500 whitespace-nowrap"
        >
          {formatDate(row.created_at)}
        </time>
      </div>
    </header>

    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
      {row.message}
    </p>

    {/* Only shown when the send is known to have failed. `null` means the
        status was never recorded, which is not the same as a failure. */}
    {row.email_sent === false && (
      <p className="mt-4 rounded-lg border border-coral/25 bg-coral/[0.07] px-3 py-2 text-xs text-coral">
        Notification email was not delivered
        {row.email_error ? `: ${row.email_error}` : "."}
      </p>
    )}

    {/* Collapsed by default — the metadata is for the rare case where a
        submission looks like spam, not something to read every time. */}
    <details className="mt-4 group">
      <summary className="cursor-pointer list-none text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-300">
        Metadata
      </summary>
      <dl className="mt-3 grid gap-2 text-xs text-neutral-400 sm:grid-cols-[7rem_1fr]">
        <dt className="text-neutral-500">IP address</dt>
        <dd className="break-all">{row.ip_address ?? "—"}</dd>
        <dt className="text-neutral-500">User agent</dt>
        <dd className="break-all">{row.user_agent ?? "—"}</dd>
        <dt className="text-neutral-500">Submission ID</dt>
        <dd className="break-all font-mono">{row.id}</dd>
      </dl>
    </details>

    <footer className="mt-4 flex justify-end border-t border-white/[0.06] pt-3">
      <DeleteButton id={row.id} name={row.name} />
    </footer>
  </article>
);

const AdminPage = async ({ searchParams }: PageProps) => {
  // Second of the two checks — the proxy already confirmed the signature, this
  // one guarantees no data is read without a valid session even if the matcher
  // is ever changed or the route is reached some other way.
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number.parseInt(params.page ?? "1", 10);

  const [stats, result] = await Promise.all([
    getSubmissionStats(),
    listSubmissions(search, page),
  ]);

  const buildHref = (targetPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const firstOnPage = (result.page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(result.page * PAGE_SIZE, result.total);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-eyebrow">Admin</p>
          <h1 className="text-heading mt-1">Contact submissions</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Signed in as {session.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Last 7 days" value={String(stats.last7Days)} />
        <StatCard
          label="Most recent"
          value={stats.latest ? formatDate(stats.latest).split(",")[0] : "—"}
        />
      </section>

      {/* A plain GET form, so a search is a real URL you can bookmark, share
          or reload without re-posting anything. */}
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

      <p className="mt-6 text-sm text-neutral-500">
        {result.total === 0
          ? search
            ? `No submissions match “${search}”.`
            : "No submissions yet."
          : `Showing ${firstOnPage}–${lastOnPage} of ${result.total}`}
      </p>

      <section className="mt-4 space-y-4">
        {result.rows.map((row) => (
          <SubmissionRow key={row.id} row={row} />
        ))}
      </section>

      {result.pageCount > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-10 flex items-center justify-between gap-4"
        >
          {result.page > 1 ? (
            <Link
              href={buildHref(result.page - 1)}
              className="btn-ghost px-5 py-2 text-sm"
            >
              <span>← Newer</span>
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-neutral-500">
            Page {result.page} of {result.pageCount}
          </span>

          {result.page < result.pageCount ? (
            <Link
              href={buildHref(result.page + 1)}
              className="btn-ghost px-5 py-2 text-sm"
            >
              <span>Older →</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
};

export default AdminPage;
