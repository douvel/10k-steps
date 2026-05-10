import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { HEALTHKIT_PERMISSIONS, HEALTH_CONNECT_STEPS_RECORD } from '../constants/health';

export interface DaySteps {
  date: string; // YYYY-MM-DD
  steps: number;
}

export interface HealthState {
  todaySteps: number;
  monthHistory: DaySteps[];
  hasPermission: boolean;
  isMockData: boolean;
  isLoading: boolean;
  error: string | null;
}

// ── Mock data used when permissions are denied or API is unavailable ──────────

function buildMockHistory(): DaySteps[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayOfMonth = today.getDate();
  const history: DaySteps[] = [];

  for (let d = 1; d <= dayOfMonth; d++) {
    const date = new Date(year, month, d);
    history.push({
      date: localDateStr(date),
      steps: 6000 + Math.floor(Math.random() * 8000),
    });
  }
  return history;
}

// Always use LOCAL calendar date — toISOString() is UTC and causes key
// mismatches near midnight in non-UTC timezones (e.g. France UTC+2).
function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

// ── iOS — HealthKit ───────────────────────────────────────────────────────────

async function fetchIOS(): Promise<Pick<HealthState, 'todaySteps' | 'monthHistory' | 'hasPermission'>> {
  // react-native-health is a native module and is unavailable in Expo Go.
  // The try/catch below catches "NativeModule not available" gracefully.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let AppleHealthKit: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnHealth = require('react-native-health');
    // Handle both CommonJS (module.exports) and ES module (.default) exports
    AppleHealthKit = rnHealth?.default ?? rnHealth;
  } catch (e) {
    throw new Error('HealthKit module load failed: ' + String(e));
  }

  if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
    throw new Error(
      'HealthKit: initHealthKit not found. Module keys: ' +
        Object.keys(AppleHealthKit ?? {}).join(', ')
    );
  }

  // Request HealthKit permission for StepCount read access
  // On the iOS Simulator, initHealthKit's callback can silently never fire — guard with a 5s timeout.
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('HealthKit init timed out')), 5000);
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err: string | null) => {
      clearTimeout(timer);
      // Some versions pass err="null" (string) or {} (empty object) on success — treat those as success
      const realError =
        err &&
        err !== 'null' &&
        !(typeof err === 'object' && Object.keys(err as object).length === 0);
      if (realError) reject(new Error('HealthKit init: ' + JSON.stringify(err)));
      else resolve();
    });
  });

  const now = new Date();
  const todayStart = startOfDay(now);
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();

  // Use noon of yesterday — unambiguous in any timezone for getStepCount
  const yesterdayNoon = new Date(year, month, dayOfMonth - 1, 12, 0, 0);
  const yesterdayKey = localDateStr(new Date(year, month, dayOfMonth - 1));

  // Read today's step count (midnight → now)
  const todaySteps = await new Promise<number>((resolve, reject) => {
    AppleHealthKit.getStepCount(
      { date: todayStart.toISOString() },
      (err, result) => {
        if (err) reject(err);
        else resolve(result?.value ?? 0);
      },
    );
  });

  // Read yesterday's steps via live endpoint — getDailyStepCountSamples can
  // lag hours after midnight before finalising the previous day's aggregate.
  // Using noon avoids UTC/local boundary ambiguity for getStepCount's date param.
  const yesterdaySteps = await new Promise<number>((resolve) => {
    AppleHealthKit.getStepCount(
      { date: yesterdayNoon.toISOString() },
      (err, result) => resolve(err ? 0 : (result?.value ?? 0)),
    );
  });

  // Read daily step totals for each day of the current month
  const monthStart = new Date(year, month, 1);

  const monthHistory = await new Promise<DaySteps[]>((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: monthStart.toISOString(),
        endDate: now.toISOString(),
      },
      (err, results) => {
        if (err) { reject(err); return; }
        // Use LOCAL date — HealthKit may return UTC midnight after consolidation
        // which would shift dates by 1 in UTC+N timezones near midnight.
        const map = new Map<string, number>();
        for (const r of results) {
          const key = localDateStr(new Date(r.startDate));
          map.set(key, (map.get(key) ?? 0) + r.value);
        }
        const history: DaySteps[] = [];
        for (let d = 1; d <= dayOfMonth; d++) {
          const key = localDateStr(new Date(year, month, d));
          let steps = map.get(key) ?? 0;
          // Patch: if HealthKit hasn't finalised yesterday yet, use live value
          if (key === yesterdayKey && steps < yesterdaySteps) {
            steps = yesterdaySteps;
          }
          history.push({ date: key, steps });
        }
        resolve(history);
      },
    );
  });

  return { todaySteps, monthHistory, hasPermission: true };
}

// ── Android — Health Connect ──────────────────────────────────────────────────

async function fetchAndroid(): Promise<Pick<HealthState, 'todaySteps' | 'monthHistory' | 'hasPermission'>> {
  let HealthConnect: typeof import('react-native-health-connect');
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    HealthConnect = require('react-native-health-connect');
  } catch {
    throw new Error('Health Connect module unavailable (Expo Go)');
  }

  const { initialize, requestPermission, readRecords } = HealthConnect;

  // Initialize Health Connect SDK (required before any other call)
  const available = await initialize();
  if (!available) throw new Error('Health Connect not available on this device');

  // Request read permission for Steps
  const granted = await requestPermission([
    { accessType: 'read', recordType: HEALTH_CONNECT_STEPS_RECORD },
  ]);
  if (!granted.length) throw new Error('Health Connect permission denied');

  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Read today's steps as one aggregated bucket
  const todayResult = await readRecords(HEALTH_CONNECT_STEPS_RECORD, {
    timeRangeFilter: {
      operator: 'between',
      startTime: todayStart.toISOString(),
      endTime: now.toISOString(),
    },
  });
  const todaySteps = (todayResult.records as Array<{ count: number }>)
    .reduce((sum, r) => sum + r.count, 0);

  // Read this month's steps, then bucket by day
  const monthResult = await readRecords(HEALTH_CONNECT_STEPS_RECORD, {
    timeRangeFilter: {
      operator: 'between',
      startTime: monthStart.toISOString(),
      endTime: now.toISOString(),
    },
  });

  const dayMap = new Map<string, number>();
  for (const record of monthResult.records as Array<{ startTime: string; count: number }>) {
    const key = localDateStr(new Date(record.startTime));
    dayMap.set(key, (dayMap.get(key) ?? 0) + record.count);
  }

  const monthHistory: DaySteps[] = [];
  for (let d = 1; d <= now.getDate(); d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    const key = localDateStr(date);
    monthHistory.push({ date: key, steps: dayMap.get(key) ?? 0 });
  }

  return { todaySteps, monthHistory, hasPermission: true };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHealthData() {
  const [state, setState] = useState<HealthState>({
    todaySteps: 0,
    monthHistory: [],
    hasPermission: false,
    isMockData: false,
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      let data: Pick<HealthState, 'todaySteps' | 'monthHistory' | 'hasPermission'>;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('HealthKit fetch timed out (simulator?)')), 5000)
      );
      if (Platform.OS === 'ios') {
        data = await Promise.race([fetchIOS(), timeoutPromise]);
      } else {
        data = await fetchAndroid();
      }
      setState({ ...data, isMockData: false, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const mock = buildMockHistory();
      setState({
        todaySteps: mock[mock.length - 1]?.steps ?? 0,
        monthHistory: mock,
        hasPermission: false,
        isMockData: true,
        isLoading: false,
        error: message,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
