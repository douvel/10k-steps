import { getPaceState } from '../pace';
import en from '../../i18n/locales/en';

const GOAL = 5000;

describe('getPaceState', () => {
  it('reports the goal-reached state regardless of diff once the month is done', () => {
    const state = getPaceState(en, 'en-US', 999, GOAL, 999, true);
    expect(state.emoji).toBe('👏');
    expect(state.label).toBe(en.dashboard.paceGoalReached);
  });

  // Table from CLAUDE.md "Système de couleurs / états (getPaceState)"
  it.each([
    { diff: -600, ratio: '-12%', color: '#DC2626', emoji: '😰' },
    { diff: -300, ratio: '-6%', color: '#EF4444', emoji: '😥' },
    { diff: -150, ratio: '-3%', color: '#3B82F6', emoji: '😯' },
    { diff: 0, ratio: '0%', color: '#3B82F6', emoji: '🫡' },
    { diff: 150, ratio: '+3%', color: '#3B82F6', emoji: '👍' },
    { diff: 300, ratio: '+6%', color: '#4ADE80', emoji: '💪' },
    { diff: 600, ratio: '+12%', color: '#16A34A', emoji: '🤩' },
  ])('maps a $ratio daily diff to $emoji / $color', ({ diff, color, emoji }) => {
    const state = getPaceState(en, 'en-US', diff, GOAL, diff, false);
    expect(state.color).toBe(color);
    expect(state.emoji).toBe(emoji);
  });

  it('treats the +-1% band as on track', () => {
    const state = getPaceState(en, 'en-US', 50, GOAL, 50, false); // +1%
    expect(state.label).toBe(en.dashboard.paceOnTrack);
  });

  // Exact threshold values, to catch an off-by-one between `<` and `<=` at each
  // boundary in the table (see utils/pace.ts) — the interior samples above only
  // exercise the middle of each band, not the edges.
  it.each([
    // -10% is excluded from the worst band (strict `<`): falls into the next one down.
    { diff: -500, emoji: '😥', color: '#EF4444' },
    // -4% is excluded from the "😥" band (strict `<`): falls into "😯".
    { diff: -200, emoji: '😯', color: '#3B82F6' },
    // -1% is included in "on track" (`<=`).
    { diff: -50, emoji: '🫡', color: '#3B82F6' },
    // +4% is included in the low-ahead band (`<=`), not the mid one.
    { diff: 200, emoji: '👍', color: '#3B82F6' },
    // +10% is included in the mid-ahead band (`<=`), not the top one.
    { diff: 500, emoji: '💪', color: '#4ADE80' },
  ])('at the exact boundary, diff=$diff maps to $emoji / $color', ({ diff, emoji, color }) => {
    const state = getPaceState(en, 'en-US', diff, GOAL, diff, false);
    expect(state.emoji).toBe(emoji);
    expect(state.color).toBe(color);
  });

  it('formats the per-day and cumulative labels independently', () => {
    const state = getPaceState(en, 'en-US', -600, GOAL, -12000, false);
    expect(state.label).toBe(en.dashboard.paceBehindPerDay('600'));
    expect(state.totalLabel).toBe(en.dashboard.paceBehindTotal('12,000'));
  });
});
