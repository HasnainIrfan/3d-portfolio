import { type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  budget: string | null;
  message: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  email_sent?: boolean | null;
  email_error?: string | null;
}

export const PAGE_SIZE = 25;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requireClient = async (): Promise<SupabaseClient> => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured on this deployment.");
  }
  return supabase;
};

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
  const supabase = await requireClient();
  const term = sanitiseSearch(search);

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

export const getSubmissionStats = async (): Promise<{
  total: number;
  last7Days: number;
  latest: string | null;
}> => {
  const supabase = await requireClient();
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

export const deleteSubmission = async (id: string): Promise<void> => {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Invalid submission id.");
  }

  const supabase = await requireClient();
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete submission:", error.message);
    throw new Error("Could not delete that submission.");
  }
};
