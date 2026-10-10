import { computeMonthlyStats, computeYearlyStats } from '../historyStats';

describe('computeMonthlyStats', () => {
  const GOAL = 10_000;

  it('sums steps, finds the best month, and counts months meeting their own day-adjusted goal', () => {
    const monthlyTotals = [
      { year: 2026, month: 0, steps: 310_000 }, // Jan, 31 days, goal 310,000 -> meets exactly
      { year: 2026, month: 1, steps: 270_000 }, // Feb 2026 (not a leap year), 28 days, goal 280,000 -> below
      { year: 2026, month: 2, steps: 320_000 }, // Mar, 31 days, goal 310,000 -> above, and the best
    ];

    const stats = computeMonthlyStats(monthlyTotals, GOAL);

    expect(stats.totalSteps).toBe(900_000);
    expect(stats.bestMonth).toEqual(monthlyTotals[2]);
    expect(stats.monthsAbove).toBe(2);
  });

  it('returns a neutral bestMonth and zero stats for an empty list', () => {
    const stats = computeMonthlyStats([], GOAL);
    expect(stats.totalSteps).toBe(0);
    expect(stats.bestMonth).toEqual({ steps: 0, month: -1, year: 0 });
    expect(stats.monthsAbove).toBe(0);
  });
});

describe('computeYearlyStats', () => {
  it('sums steps and finds the best year', () => {
    const yearlyTotals = [
      { year: 2023, steps: 2_800_000 },
      { year: 2024, steps: 3_200_000 },
      { year: 2025, steps: 3_100_000 },
    ];

    const stats = computeYearlyStats(yearlyTotals, 2025);

    expect(stats.totalSteps).toBe(9_100_000);
    expect(stats.bestYear).toEqual(yearlyTotals[1]);
  });

  it('returns a neutral bestYear for an empty list', () => {
    const stats = computeYearlyStats([], 2026);
    expect(stats.totalSteps).toBe(0);
    expect(stats.bestYear).toEqual({ year: 2026, steps: 0 });
  });
});

import { computeMonthDetail } from '../historyStats';

describe('computeMonthDetail', () => {
  it('averages a past month over all its days', () => {
    const d = computeMonthDetail({ year: 2026, month: 8, steps: 300000 }, 10000, new Date(2026, 9, 10));
    expect(d).toEqual({ goalPct: 100, avgPerDay: 10000, reached: true });
  });
  it('averages the current month over days elapsed', () => {
    const d = computeMonthDetail({ year: 2026, month: 9, steps: 100000 }, 10000, new Date(2026, 9, 10));
    expect(d.avgPerDay).toBe(10000);
    expect(d.goalPct).toBe(32);
    expect(d.reached).toBe(false);
  });
});

import { computeYearDetail } from '../historyStats';

describe('computeYearDetail', () => {
  it('averages a past year over all its days (leap-aware)', () => {
    const d = computeYearDetail({ year: 2024, steps: 3660000 }, 10000, new Date(2026, 9, 10));
    expect(d).toEqual({ goalPct: 100, avgPerDay: 10000, reached: true });
  });
  it('averages the current year over days elapsed', () => {
    // Oct 10 2026 is day 283
    const d = computeYearDetail({ year: 2026, steps: 2830000 }, 10000, new Date(2026, 9, 10));
    expect(d.avgPerDay).toBe(10000);
    expect(d.goalPct).toBe(78);
    expect(d.reached).toBe(false);
  });
});
