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

// Detail for one month of the Mois view. The current month's average is over days elapsed
// (not the whole month), otherwise it would be understated until the month ends.
export function computeMonthDetail(
  m: { year: number; month: number; steps: number },
  dailyGoal: number,
  now: Date,
) {
  const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
  const isCurrent = m.year === now.getFullYear() && m.month === now.getMonth();
  const daysCounted = isCurrent ? now.getDate() : daysInMonth;
  const goal = dailyGoal * daysInMonth;
  return {
    goalPct: goal > 0 ? Math.round((m.steps / goal) * 100) : 0,
    avgPerDay: Math.round(m.steps / daysCounted),
    reached: m.steps >= goal,
  };
}
