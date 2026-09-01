import Link from "next/link";
import { type FC } from "react";
import { type AdminPaginationProps } from "@/types/admin-types";

export const AdminPagination: FC<AdminPaginationProps> = ({
  page,
  pageCount,
  buildHref,
}) => {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="btn-ghost px-5 py-2 text-sm">
          <span>← Newer</span>
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-neutral-500">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={buildHref(page + 1)} className="btn-ghost px-5 py-2 text-sm">
          <span>Older →</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
