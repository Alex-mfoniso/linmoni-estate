export function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffMinutes) < 1) {
    return "just now";
  }

  if (Math.abs(diffMinutes) < 60) {
    return `${Math.abs(diffMinutes)}m ago`;
  }

  if (Math.abs(diffHours) < 24) {
    return `${Math.abs(diffHours)}h ago`;
  }

  if (Math.abs(diffDays) < 7) {
    return `${Math.abs(diffDays)}d ago`;
  }

  return date.toLocaleDateString();
}
