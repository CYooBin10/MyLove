import { addYears, differenceInCalendarDays, format, isSameDay } from "date-fns";

export function formatDate(value: Date | string | null | undefined, pattern = "dd/MM/yyyy") {
  if (!value) return "Chưa đặt";
  return format(new Date(value), pattern);
}

export function getRelationshipStats(startDate: Date | string) {
  const start = new Date(startDate);
  const now = new Date();
  const totalDays = Math.max(1, differenceInCalendarDays(now, start) + 1);

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += previousMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { totalDays, years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

export function getDailyQuote(quotes: string[]) {
  const day = differenceInCalendarDays(new Date(), new Date("2024-01-01"));
  return quotes[Math.abs(day) % quotes.length];
}

export function getNextOccurrence(dateValue: Date | string, repeatsYearly: boolean) {
  const date = new Date(dateValue);
  if (!repeatsYearly) return date;
  const now = new Date();
  let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next = addYears(next, 1);
  }
  return next;
}

export function getCountdownLabel(dateValue: Date | string, repeatsYearly: boolean) {
  const next = getNextOccurrence(dateValue, repeatsYearly);
  const now = new Date();
  const diff = differenceInCalendarDays(next, now);
  if (diff <= 0 || isSameDay(next, now)) return "Hôm nay";
  if (diff === 1) return "Còn 1 ngày";
  return `Còn ${diff} ngày`;
}
