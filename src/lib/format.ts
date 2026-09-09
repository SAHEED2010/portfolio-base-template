// Date columns come back as "YYYY-MM-DD". Formatting with the default
// timezone would shift them a day backwards for anyone west of UTC
// (the string parses as UTC midnight), so every format here is pinned
// to UTC.

const monthYear = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: string): string {
  return monthYear.format(new Date(date));
}

// A null end_date means "still there" — see SCHEMA.md.
export function formatDateRange(start: string, end: string | null): string {
  return `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : "Present"}`;
}

// created_at is a real timestamptz (unlike the date-only columns
// above), so the UTC-pinning concern doesn't apply — formatting it in
// the viewer's own local time zone is exactly what an inbox needs.
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(isoTimestamp: string): string {
  return dateTime.format(new Date(isoTimestamp));
}

export function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
