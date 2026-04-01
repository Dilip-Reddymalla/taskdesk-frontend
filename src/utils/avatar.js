/**
 * Avatar utilities — deterministic color + initials from username.
 */

const AVATAR_COLORS = [
  '#7C3AED', '#06B6D4', '#10B981', '#F59E0B',
  '#EC4899', '#EF4444', '#8B5CF6', '#0EA5E9',
  '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

/**
 * Get a deterministic color for a username by hashing it.
 */
export function getAvatarColor(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get the initials from a username (1–2 characters).
 * "john_doe" → "JD"
 * "dilip"    → "DI"
 */
export function getInitials(username = '') {
  const parts = username
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (username[0] ?? '?').toUpperCase();
}
