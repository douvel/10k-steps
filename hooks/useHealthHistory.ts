import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { HEALTHKIT_PERMISSIONS, HEALTH_CONNECT_STEPS_RECORD } from '../constants/health';
import type AppleHealthKitModule from 'react-native-health';
import type { HealthKitPermissions } from 'react-native-health';

export interface MonthTotal {
  year: number;
  month: number; // 0-11
  steps: number;
}

export interface YearTotal {
  year: number;
  steps: number;
}

// See useHealthData.ts's HealthErrorKind for what each case means.
export type HealthErrorKind = 'unavailable' | 'permission-denied' | 'unknown';

class HealthDataError extends Error {
  kind: HealthErrorKind;
  constructor(message: string, kind: HealthErrorKind) {
    super(message);
    this.kind = kind;
  }
}

export interface HealthHistoryState {
  monthlyTotals: MonthTotal[]; // months of current year up to today
  yearlyTotals: YearTotal[];   // last N years
  isLoading: boolean;
  error: string | null;
  errorKind: HealthErrorKind | null;
  isMockData: boolean;
}

const YEARS_BACK = 4;

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
  let AppleHealthKit: typeof AppleHealthKitModule | undefined;
  try {
    const rnHealth = require('react-native-health');
    AppleHealthKit = (rnHealth?.default ?? rnHealth) as typeof AppleHealthKitModule;
  } catch (e) {
    throw new HealthDataError('HealthKit module load failed: ' + String(e), 'unavailable');
  }

  if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
    throw new HealthDataError('HealthKit: initHealthKit not found', 'unavailable');
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new HealthDataError('HealthKit init timed out', 'unavailable')),
      5000,
    );
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS as unknown as HealthKitPermissions, (err) => {
      clearTimeout(timer);
      const realError =
        err &&
        err !== 'null' &&
        !(typeof err === 'object' && Object.keys(err as object).length === 0);
      if (realError) reject(new HealthDataError('HealthKit init: ' + JSON.stringify(err), 'unknown'));
      else resolve();
    });
  });

  const now = new Date();
  const startYear = now.getFullYear() - YEARS_BACK + 1;
  const rangeStart = new Date(startYear, 0, 1);

  const rawSamples = await new Promise<Array<{ startDate: string; value: number }>>((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      { startDate: rangeStart.toISOString(), endDate: now.toISOString() },
      (err, results) => {
        if (err) { reject(new HealthDataError('getDailyStepCountSamples: ' + JSON.stringify(err), 'unknown')); return; }
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
    throw new HealthDataError('Health Connect module unavailable', 'unavailable');
  }

  const { initialize, requestPermission, readRecords } = HealthConnect;
  const available = await initialize();
  if (!available) throw new HealthDataError('Health Connect not available', 'unavailable');

  const granted = await requestPermission([{ accessType: 'read', recordType: HEALTH_CONNECT_STEPS_RECORD }]);
  if (!granted.length) throw new HealthDataError('Health Connect permission denied', 'permission-denied');

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
    errorKind: null,
    isMockData: false,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null, errorKind: null }));
    try {
      let data: Pick<HealthHistoryState, 'monthlyTotals' | 'yearlyTotals'>;
      if (Platform.OS === 'ios') {
        data = await fetchIOSHistory();
      } else {
        data = await fetchAndroidHistory();
      }
      setState({ ...data, isLoading: false, error: null, errorKind: null, isMockData: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const kind: HealthErrorKind = err instanceof HealthDataError ? err.kind : 'unknown';

      if (kind === 'unavailable') {
        // Dev-time stand-in only: no native module/device to read real steps from.
        const now = new Date();
        setState({
          monthlyTotals: buildMockMonthly(now),
          yearlyTotals: buildMockYearly(now),
          isLoading: false,
          error: message,
          errorKind: kind,
          isMockData: true,
        });
        return;
      }

      // Permission denied or a genuine unexpected error — never fabricate steps for these.
      setState({
        monthlyTotals: [],
        yearlyTotals: [],
        isLoading: false,
        error: message,
        errorKind: kind,
        isMockData: false,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
