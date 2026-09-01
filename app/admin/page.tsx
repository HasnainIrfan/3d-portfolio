import { redirect } from "next/navigation";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminSearch } from "@/components/admin/admin-search";
import { NotAdminNotice } from "@/components/admin/not-admin-notice";
import { SetupNotice } from "@/components/admin/setup-notice";
import { StatCard } from "@/components/admin/stat-card";
import { SubmissionCard } from "@/components/admin/submission-card";
import { formatDate } from "@/helpers/format-helpers";
import { getAdminState } from "@/lib/admin/auth";
import { PAGE_SIZE, getSubmissionStats, listSubmissions } from "@/lib/admin/data";
import { type AdminPageProps } from "@/types/admin-types";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const state = await getAdminState();

  if (state.status === "not-configured") {
    return (
      <AdminPanel>
        <SetupNotice />
      </AdminPanel>
    );
  }

  if (state.status === "schema-missing") {
    return (
      <AdminPanel>
        <SetupNotice variant="no-schema" />
      </AdminPanel>
    );
  }

  if (state.status === "signed-out") redirect("/admin/login");

  if (state.status === "not-admin") {
    return (
      <AdminPanel>
        <NotAdminNotice email={state.email} />
      </AdminPanel>
    );
  }

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
            Signed in as {state.user.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Last 7 days" value={String(stats.last7Days)} />
        <StatCard
          label="Most recent"
          value={stats.latest ? formatDate(stats.latest) : "—"}
        />
      </section>

      <AdminSearch search={search} />

      <p className="mt-6 text-sm text-neutral-500">
        {result.total === 0
          ? search
            ? `No submissions match “${search}”.`
            : "No submissions yet."
          : `Showing ${firstOnPage}–${lastOnPage} of ${result.total}`}
      </p>

      <section className="mt-4 space-y-4">
        {result.rows.map((row) => (
          <SubmissionCard key={row.id} row={row} />
        ))}
      </section>

      <AdminPagination
        page={result.page}
        pageCount={result.pageCount}
        buildHref={buildHref}
      />
    </main>
  );
};

export default AdminPage;
