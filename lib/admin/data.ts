/**
 * Data access for the admin area: reads of the contact_submissions table,
 * which is the only table this project has.
 *
 * Everything here uses the Supabase service-role key, which bypasses RLS. That
 * is only safe because none of it is reachable from the browser: these
 * functions are called from Server Components and Route Handlers, and the key
 * has no `NEXT_PUBLIC_` prefix so it cannot be bundled into client code.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  budget: string | null;
  message: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  /** null when unknown — either the row predates these columns, or they have
   *  not been added to the database yet. See app/api/contact/route.ts. */
  email_sent?: boolean | null;
  email_error?: string | null;
}

export const PAGE_SIZE = 25;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getServiceClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
};

/* -------------------------------------------------------------------------- */
/*  Submissions                                                               */
/* -------------------------------------------------------------------------- */

/**
 * PostgREST parses `or=(...)` as a filter expression, where comma separates
 * terms and parentheses group them. A raw search string could therefore inject
 * extra filters, so the query is reduced to characters that cannot mean
 * anything to that grammar before it is interpolated.
 */
const sanitiseSearch = (raw: string): string =>
  raw.replace(/[^a-zA-Z0-9@._\- ]/g, "").trim().slice(0, 80);

export interface SubmissionPage {
  rows: ContactSubmission[];
  total: number;
  page: number;
  pageCount: number;
}

export const listSubmissions = async (
  search: string,
  page: number
): Promise<SubmissionPage> => {
  const supabase = getServiceClient();
  const term = sanitiseSearch(search);

  // Applied identically to the count and the fetch, so the clamp below is
  // computed against the same result set that is about to be read.
  const applyFilter = <T extends { or: (f: string) => T }>(query: T): T =>
    term
      ? query.or(
          `name.ilike.*${term}*,email.ilike.*${term}*,message.ilike.*${term}*`
        )
      : query;

  const { count, error: countError } = await applyFilter(
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
  );

  if (countError) {
    console.error("Failed to count submissions:", countError.message);
    throw new Error("Could not load submissions.");
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Counting first is what makes the page number safe to clamp. PostgREST
  // answers a range whose offset is past the end with an error rather than an
  // empty list, so `?page=999` used to surface as a 500 — reachable by editing
  // the URL, or just by paging forward after rows were removed.
  const requested =
    Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePage = Math.min(requested, pageCount);

  if (total === 0) {
    return { rows: [], total: 0, page: 1, pageCount: 1 };
  }

  const from = (safePage - 1) * PAGE_SIZE;
  const { data, error } = await applyFilter(
    supabase
      .from("contact_submissions")
      // `*` rather than a column list so the dashboard still renders on a
      // database where email_sent / email_error have not been added yet —
      // PostgREST rejects the whole query for one unknown column.
      .select("*")
      .order("created_at", { ascending: false })
  ).range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("Failed to load submissions:", error.message);
    throw new Error("Could not load submissions.");
  }

  return {
    rows: (data ?? []) as ContactSubmission[],
    total,
    page: safePage,
    pageCount,
  };
};

/** Counts for the dashboard header — cheap, since none of them fetch rows. */
export const getSubmissionStats = async (): Promise<{
  total: number;
  last7Days: number;
  latest: string | null;
}> => {
  const supabase = getServiceClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalResult, weekResult, latestResult] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("contact_submissions")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    total: totalResult.count ?? 0,
    last7Days: weekResult.count ?? 0,
    latest: latestResult.data?.created_at ?? null,
  };
};

/* -------------------------------------------------------------------------- */
/*  Deletion                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Removes one submission. Permanent — there is no soft-delete flag and no
 * recycle bin, because a table you have to remember to filter is worse than an
 * honest delete for a list this small.
 *
 * The caller is responsible for having checked the session first; nothing in
 * this module knows about authentication.
 */
export const deleteSubmission = async (id: string): Promise<void> => {
  // Rejected before the query so a malformed id cannot reach PostgREST as a
  // filter value at all.
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Invalid submission id.");
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete submission:", error.message);
    throw new Error("Could not delete that submission.");
  }
};
