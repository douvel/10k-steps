export interface DaySteps {
  date: string; // YYYY-MM-DD
  steps: number;
}

// Always use LOCAL calendar date — toISOString() is UTC and shifts dates near
// midnight in non-UTC timezones (e.g. France UTC+2).
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// getDailyStepCountSamples can lag or omit today's entry entirely, so today's total always
// comes from the live todaySteps value rather than whatever monthHistory reports for it.
export function computeMonthlyTotal(monthHistory: DaySteps[], todaySteps: number, now: Date): number {
  const todayKey = localDateKey(now);
  const historicalTotal = monthHistory
    .filter(d => d.date !== todayKey)
    .reduce((sum, d) => sum + d.steps, 0);
  return historicalTotal + todaySteps;
}

export interface MonthProgress {
  daysInMonth: number;
  dayOfMonth: number;
  daysElapsed: number;
  daysRemaining: number;
  monthlyGoal: number;
  dailyAverage: number;
  remainingSteps: number;
  daysForAverage: number;
  requiredDailyAverage: number;
  monthDone: boolean;
  cumulativeDelta: number;
}

// See CLAUDE.md "Jours restants dans le mois" — daysRemaining includes today.
export function computeMonthProgress(
  now: Date,
  dailyGoal: number,
  monthlyTotal: number,
  excludeToday: boolean,
): MonthProgress {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);
  const monthlyGoal = dailyGoal * daysInMonth;
  const dailyAverage = Math.round(monthlyTotal / daysElapsed);
  const remainingSteps = Math.max(0, monthlyGoal - monthlyTotal);
  const daysForAverage = excludeToday ? Math.max(1, daysRemaining - 1) : daysRemaining;
  const requiredDailyAverage = Math.round(remainingSteps / daysForAverage);
  const monthDone = monthlyTotal >= monthlyGoal;
  const cumulativeDelta = monthlyTotal - dailyGoal * daysElapsed;

  return {
    daysInMonth, dayOfMonth, daysElapsed, daysRemaining, monthlyGoal,
    dailyAverage, remainingSteps, daysForAverage, requiredDailyAverage,
    monthDone, cumulativeDelta,
  };
}
