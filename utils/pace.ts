import type { Translations } from '../i18n/locales/en';

// See CLAUDE.md "Système de couleurs / états (getPaceState)" for the table this implements.
export type PaceState = { color: string; emoji: string; label: string; totalLabel: string };

export function getPaceState(
  t: Translations,
  localeTag: string,
  diff: number,
  goal: number,
  cumulativeDelta: number,
  monthDone: boolean,
): PaceState {
  const absDiff = Math.round(Math.abs(diff)).toLocaleString(localeTag);
  const plusDiff = Math.round(diff).toLocaleString(localeTag);
  const absTotal = Math.round(Math.abs(cumulativeDelta)).toLocaleString(localeTag);
  const plusTotal = Math.round(cumulativeDelta).toLocaleString(localeTag);
  if (monthDone)        return { color: '#F59E0B', emoji: '👏', label: t.dashboard.paceGoalReached, totalLabel: t.dashboard.paceGoalReached };
  const ratio = diff / goal;
  if (ratio < -0.10)   return { color: '#DC2626', emoji: '😰', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio < -0.04)   return { color: '#EF4444', emoji: '😥', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio < -0.01)   return { color: '#3B82F6', emoji: '😯', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio <=  0.01)  return { color: '#3B82F6', emoji: '🫡', label: t.dashboard.paceOnTrack, totalLabel: t.dashboard.paceOnTrack };
  if (ratio <=  0.04)  return { color: '#3B82F6', emoji: '👍', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
  if (ratio <=  0.10)  return { color: '#4ADE80', emoji: '💪', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
  return                      { color: '#16A34A', emoji: '🤩', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
}
