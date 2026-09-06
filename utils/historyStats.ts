export interface MonthTotal {
  year: number;
  month: number; // 0-11
  steps: number;
}

export interface YearTotal {
  year: number;
  steps: number;
}

export interface MonthlyStats {
  totalSteps: number;
  bestMonth: MonthTotal;
  monthsAbove: number;
}

// A month counts as "above goal" against dailyGoal × its own day count, since
// months have different lengths (see app/(tabs)/history.tsx's MoisView).
export function computeMonthlyStats(monthlyTotals: MonthTotal[], dailyGoal: number): MonthlyStats {
  const totalSteps = monthlyTotals.reduce((s, m) => s + m.steps, 0);
  const bestMonth = monthlyTotals.reduce(
    (best, m) => (m.steps > best.steps ? m : best),
    monthlyTotals[0] ?? { steps: 0, month: -1, year: 0 },
  );
  const monthsAbove = monthlyTotals.filter(m => {
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    return m.steps >= dailyGoal * daysInMonth;
  }).length;
  return { totalSteps, bestMonth, monthsAbove };
}

export interface YearlyStats {
  totalSteps: number;
  bestYear: YearTotal;
}

export function computeYearlyStats(yearlyTotals: YearTotal[], currentYear: number): YearlyStats {
  const totalSteps = yearlyTotals.reduce((s, y) => s + y.steps, 0);
  const bestYear = yearlyTotals.reduce(
    (best, y) => (y.steps > best.steps ? y : best),
    yearlyTotals[0] ?? { year: currentYear, steps: 0 },
  );
  return { totalSteps, bestYear };
}
