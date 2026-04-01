/**
 * Date formatting utilities for Task Desk.
 */

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a date string/object to "Apr 1, 2026"
 */
export function formatDate(date) {
  const d = new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format a date to "Mon, Apr 1"
 */
export function formatShortDate(date) {
  const d = new Date(date);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Format a date to "Apr 1" (no year)
 */
export function formatMonthDay(date) {
  const d = new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Relative time: "2 hours ago", "just now", "3 days ago"
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (seconds < 30)  return 'just now';
  if (seconds < 60)  return `${seconds}s ago`;
  if (minutes < 60)  return `${minutes}m ago`;
  if (hours < 24)    return `${hours}h ago`;
  if (days === 1)    return 'yesterday';
  if (days < 7)      return `${days}d ago`;
  return formatDate(date);
}

/**
 * Return a time-aware greeting: "Good morning", "Good afternoon", "Good evening"
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Return ISO date string "YYYY-MM-DD" for a Date object.
 */
export function toISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Check if a date is today.
 */
export function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth()    === now.getMonth() &&
         d.getDate()     === now.getDate();
}

/**
 * Check if a date is overdue (in the past and not today).
 */
export function isOverdue(date) {
  return new Date(date) < new Date() && !isToday(date);
}

/**
 * Get start and end date of the current week (Mon–Sun).
 */
export function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISODate(monday), end: toISODate(sunday) };
}
