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

  it('formats the per-day and cumulative labels independently', () => {
    const state = getPaceState(en, 'en-US', -600, GOAL, -12000, false);
    expect(state.label).toBe(en.dashboard.paceBehindPerDay('600'));
    expect(state.totalLabel).toBe(en.dashboard.paceBehindTotal('12,000'));
  });
});
