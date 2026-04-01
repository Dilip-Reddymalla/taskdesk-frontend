/**
 * XP and Level calculation helpers for Task Desk gamification.
 *
 * Level thresholds follow a simple quadratic curve:
 *   Level N requires N * 150 total XP
 *   e.g. Level 1 = 150 XP, Level 2 = 300 XP, Level 5 = 750 XP
 */

const XP_PER_LEVEL = 150;

/**
 * Calculate the current level from total XP.
 */
export function getLevel(xp) {
  if (!xp || xp < 0) return 1;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * XP required to reach a given level.
 */
export function xpForLevel(level) {
  return (level - 1) * XP_PER_LEVEL;
}

/**
 * XP needed to reach the next level from current total.
 */
export function xpToNextLevel(xp) {
  const level = getLevel(xp);
  const nextLevelXp = xpForLevel(level + 1);
  return nextLevelXp - xp;
}

/**
 * Progress percentage (0–100) within the current level.
 */
export function xpProgress(xp) {
  const level = getLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp    = xpForLevel(level + 1);
  const range = nextLevelXp - currentLevelXp;
  const earned = xp - currentLevelXp;
  return Math.min(100, Math.round((earned / range) * 100));
}

/**
 * Human-readable level title.
 */
const LEVEL_TITLES = [
  '', 'Starter', 'Learner', 'Builder', 'Achiever', 'Performer',
  'Executor', 'Champion', 'Leader', 'Expert', 'Master',
];

export function getLevelTitle(xp) {
  const level = getLevel(xp);
  return LEVEL_TITLES[level] ?? `Legend ${level}`;
}

/**
 * XP within the current level (progress numerator).
 */
export function xpInCurrentLevel(xp) {
  const level = getLevel(xp);
  return xp - xpForLevel(level);
}

/**
 * Total XP span of the current level (progress denominator).
 */
export function xpLevelSpan() {
  return XP_PER_LEVEL;
}
