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
