import { computeMonthlyTotal, computeMonthProgress } from '../monthProgress';

describe('computeMonthlyTotal', () => {
  it('ignores whatever monthHistory reports for today and uses the live value instead', () => {
    const now = new Date(2026, 8, 7); // Sep 7 2026 (local)
    const history = [
      { date: '2026-09-05', steps: 4000 },
      { date: '2026-09-06', steps: 5000 },
      { date: '2026-09-07', steps: 1000 }, // stale/lagging HealthKit value for "today"
    ];
    expect(computeMonthlyTotal(history, 6000, now)).toBe(4000 + 5000 + 6000);
  });
});

describe('computeMonthProgress', () => {
  it('includes today in daysRemaining', () => {
    // Sep 2026 has 30 days; on the 7th, 24 days remain (7..30 inclusive).
    const now = new Date(2026, 8, 7);
    const { daysInMonth, daysRemaining } = computeMonthProgress(now, 5000, 0, false);
    expect(daysInMonth).toBe(30);
    expect(daysRemaining).toBe(24);
  });

  it('excludes today from daysForAverage when excludeToday is set', () => {
    const now = new Date(2026, 8, 7);
    const included = computeMonthProgress(now, 5000, 0, false);
    const excluded = computeMonthProgress(now, 5000, 0, true);
    expect(excluded.daysForAverage).toBe(included.daysForAverage - 1);
  });

  it('never lets daysForAverage drop below 1, even on the last day of the month excluding today', () => {
    const lastDay = new Date(2026, 8, 30);
    const { daysForAverage } = computeMonthProgress(lastDay, 5000, 0, true);
    expect(daysForAverage).toBe(1);
  });

  it('computes the required daily average from what is left of the monthly goal', () => {
    const now = new Date(2026, 8, 7); // 24 days remaining, including today
    const dailyGoal = 5000;
    const monthlyGoal = dailyGoal * 30; // 150,000
    const monthlyTotal = 30_000;
    const { requiredDailyAverage, remainingSteps } = computeMonthProgress(now, dailyGoal, monthlyTotal, false);
    expect(remainingSteps).toBe(monthlyGoal - monthlyTotal);
    expect(requiredDailyAverage).toBe(Math.round((monthlyGoal - monthlyTotal) / 24));
  });

  it('flags the month as done once the total reaches the monthly goal', () => {
    const now = new Date(2026, 8, 7);
    const dailyGoal = 5000;
    const monthlyGoal = dailyGoal * 30;
    expect(computeMonthProgress(now, dailyGoal, monthlyGoal, false).monthDone).toBe(true);
    expect(computeMonthProgress(now, dailyGoal, monthlyGoal - 1, false).monthDone).toBe(false);
  });
});
