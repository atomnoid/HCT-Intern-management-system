import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export function friendlyDate(value: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function isOverdue(value: string | null, completed = false) {
  return Boolean(value && !completed && new Date(value) < new Date(new Date().toDateString()));
}
