import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { HEALTHKIT_PERMISSIONS, HEALTH_CONNECT_STEPS_RECORD } from '../constants/health';

export interface MonthTotal {
  year: number;
  month: number; // 0-11
  steps: number;
}

export interface YearTotal {
  year: number;
  steps: number;
}

export interface HealthHistoryState {
  monthlyTotals: MonthTotal[]; // months of current year up to today
  yearlyTotals: YearTotal[];   // last N years
  isLoading: boolean;
  error: string | null;
}

const YEARS_BACK = 4;

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildMockMonthly(now: Date): MonthTotal[] {
  const seed = [210000, 185000, 230000, 195000, 220000, 200000, 175000, 215000, 240000, 180000, 205000, 195000];
  const result: MonthTotal[] = [];
  for (let m = 0; m <= now.getMonth(); m++) {
    result.push({ year: now.getFullYear(), month: m, steps: seed[m] ?? 200000 });
  }
  return result;
}

function buildMockYearly(now: Date): YearTotal[] {
  const seed = [2800000, 3100000, 2950000, 3200000];
  const result: YearTotal[] = [];
  for (let i = YEARS_BACK - 1; i >= 0; i--) {
    result.push({ year: now.getFullYear() - i, steps: seed[YEARS_BACK - 1 - i] ?? 3000000 });
  }
  return result;
}

// ── iOS — HealthKit ───────────────────────────────────────────────────────────

async function fetchIOSHistory(): Promise<Pick<HealthHistoryState, 'monthlyTotals' | 'yearlyTotals'>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let AppleHealthKit: any;
  try {
    const rnHealth = require('react-native-health');
    AppleHealthKit = rnHealth?.default ?? rnHealth;
  } catch (e) {
    throw new Error('HealthKit module load failed: ' + String(e));
  }

  if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
    throw new Error('HealthKit: initHealthKit not found');
  }

  await new Promise<void>((resolve, reject) => {
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err: string | null) => {
      const realError =
        err &&
        err !== 'null' &&
        !(typeof err === 'object' && Object.keys(err as object).length === 0);
      if (realError) reject(new Error('HealthKit init: ' + JSON.stringify(err)));
      else resolve();
    });
  });

  const now = new Date();
  const startYear = now.getFullYear() - YEARS_BACK + 1;
  const rangeStart = new Date(startYear, 0, 1);

  const rawSamples = await new Promise<Array<{ startDate: string; value: number }>>((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      { startDate: rangeStart.toISOString(), endDate: now.toISOString() },
      (err: unknown, results: Array<{ startDate: string; value: number }>) => {
        if (err) { reject(err); return; }
        resolve(results ?? []);
      },
    );
  });

  // Aggregate by month-key and year-key
  const monthMap = new Map<string, number>();
  const yearMap = new Map<number, number>();

  for (const r of rawSamples) {
    const d = new Date(r.startDate);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + r.value);
    yearMap.set(d.getFullYear(), (yearMap.get(d.getFullYear()) ?? 0) + r.value);
  }

  const monthlyTotals: MonthTotal[] = [];
  for (let m = 0; m <= now.getMonth(); m++) {
    const key = `${now.getFullYear()}-${m}`;
    monthlyTotals.push({ year: now.getFullYear(), month: m, steps: monthMap.get(key) ?? 0 });
  }

  const yearlyTotals: YearTotal[] = [];
  for (let y = startYear; y <= now.getFullYear(); y++) {
    yearlyTotals.push({ year: y, steps: yearMap.get(y) ?? 0 });
  }

  return { monthlyTotals, yearlyTotals };
}

// ── Android — Health Connect ──────────────────────────────────────────────────

async function fetchAndroidHistory(): Promise<Pick<HealthHistoryState, 'monthlyTotals' | 'yearlyTotals'>> {
  let HealthConnect: typeof import('react-native-health-connect');
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    HealthConnect = require('react-native-health-connect');
  } catch {
    throw new Error('Health Connect module unavailable');
  }

  const { initialize, requestPermission, readRecords } = HealthConnect;
  const available = await initialize();
  if (!available) throw new Error('Health Connect not available');

  const granted = await requestPermission([{ accessType: 'read', recordType: HEALTH_CONNECT_STEPS_RECORD }]);
  if (!granted.length) throw new Error('Health Connect permission denied');

  const now = new Date();
  const startYear = now.getFullYear() - YEARS_BACK + 1;
  const rangeStart = new Date(startYear, 0, 1);

  const result = await readRecords(HEALTH_CONNECT_STEPS_RECORD, {
    timeRangeFilter: {
      operator: 'between',
      startTime: rangeStart.toISOString(),
      endTime: now.toISOString(),
    },
  });

  const monthMap = new Map<string, number>();
  const yearMap = new Map<number, number>();

  for (const record of result.records as Array<{ startTime: string; count: number }>) {
    const d = new Date(record.startTime);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + record.count);
    yearMap.set(d.getFullYear(), (yearMap.get(d.getFullYear()) ?? 0) + record.count);
  }

  const monthlyTotals: MonthTotal[] = [];
  for (let m = 0; m <= now.getMonth(); m++) {
    monthlyTotals.push({ year: now.getFullYear(), month: m, steps: monthMap.get(`${now.getFullYear()}-${m}`) ?? 0 });
  }

  const yearlyTotals: YearTotal[] = [];
  for (let y = startYear; y <= now.getFullYear(); y++) {
    yearlyTotals.push({ year: y, steps: yearMap.get(y) ?? 0 });
  }

  return { monthlyTotals, yearlyTotals };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHealthHistory() {
  const [state, setState] = useState<HealthHistoryState>({
    monthlyTotals: [],
    yearlyTotals: [],
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const now = new Date();
      let data: Pick<HealthHistoryState, 'monthlyTotals' | 'yearlyTotals'>;
      if (Platform.OS === 'ios') {
        data = await fetchIOSHistory();
      } else {
        data = await fetchAndroidHistory();
      }
      setState({ ...data, isLoading: false, error: null });
    } catch (err) {
      const now = new Date();
      setState({
        monthlyTotals: buildMockMonthly(now),
        yearlyTotals: buildMockYearly(now),
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
