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

export function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
