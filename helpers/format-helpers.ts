export const padIndex = (value: number): string =>
  String(value).padStart(2, "0");

export const formatCounter = (index: number, total: number): string =>
  `${padIndex(index + 1)} / ${padIndex(total)}`;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDateTime = (iso: string): string => {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed);
};

export const formatDate = (iso: string): string =>
  formatDateTime(iso).split(",")[0];
