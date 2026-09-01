/** Shared formatting used across the site and the admin inbox. */

/** 1 → "01". Used for the project counters, which read as a set, not a tally. */
export const padIndex = (value: number): string =>
  String(value).padStart(2, "0");

/** "03 / 06" */
export const formatCounter = (index: number, total: number): string =>
  `${padIndex(index + 1)} / ${padIndex(total)}`;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO timestamp, falling back to an em dash for anything unparseable. */
export const formatDateTime = (iso: string): string => {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed);
};

/** Just the date half of `formatDateTime`. */
export const formatDate = (iso: string): string =>
  formatDateTime(iso).split(",")[0];
