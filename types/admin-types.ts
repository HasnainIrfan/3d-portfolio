import { type ContactSubmission } from "@/lib/admin/data";

export interface AdminPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export interface StatCardProps {
  label: string;
  value: string;
}

export interface SubmissionCardProps {
  row: ContactSubmission;
}

export interface AdminPaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}

export interface AdminSearchProps {
  search: string;
}

export interface AdminPanelProps {
  title: string;
  children: React.ReactNode;
}
