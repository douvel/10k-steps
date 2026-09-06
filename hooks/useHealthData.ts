import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { HEALTH_CONNECT_STEPS_RECORD } from '../constants/health';
import { HealthInitError, initHealthKitOnce, initHealthConnectOnce } from './nativeHealthInit';
import type AppleHealthKitModule from 'react-native-health';

export interface DaySteps {
  date: string; // YYYY-MM-DD
  steps: number;
}

// 'unavailable' — no native module/device to read from (Expo Go, simulator timeout): mock data is a
//   reasonable dev-time stand-in.
// 'permission-denied' — the user explicitly declined health data access (only detectable on Android;
//   iOS never reports permission state, by HealthKit design).
// 'unknown' — a real, unexpected failure reading from an actual device: never fabricate steps for this.
export type HealthErrorKind = 'unavailable' | 'permission-denied' | 'unknown';

class HealthDataError extends Error {
  kind: HealthErrorKind;
  constructor(message: string, kind: HealthErrorKind) {
    super(message);
    this.kind = kind;
  }
}

export interface HealthState {
  todaySteps: number;
  monthHistory: DaySteps[];
  hasPermission: boolean;
  isMockData: boolean;
  isLoading: boolean;
  error: string | null;
  errorKind: HealthErrorKind | null;
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
  let AppleHealthKit: typeof AppleHealthKitModule | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnHealth = require('react-native-health');
    // Handle both CommonJS (module.exports) and ES module (.default) exports
    AppleHealthKit = (rnHealth?.default ?? rnHealth) as typeof AppleHealthKitModule;
  } catch (e) {
    throw new HealthDataError('HealthKit module load failed: ' + String(e), 'unavailable');
  }

  if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
    throw new HealthDataError(
      'HealthKit: initHealthKit not found. Module keys: ' +
        Object.keys(AppleHealthKit ?? {}).join(', '),
      'unavailable',
    );
  }

  // Request HealthKit permission for StepCount read access. Shared with
  // useHealthHistory so the two hooks mounted together don't each trigger their
  // own native init/permission round trip.
  try {
    await initHealthKitOnce(AppleHealthKit);
  } catch (e) {
    const timedOut = e instanceof HealthInitError && e.timedOut;
    throw new HealthDataError((e as Error).message, timedOut ? 'unavailable' : 'unknown');
  }

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
        if (err) reject(new HealthDataError('getStepCount: ' + JSON.stringify(err), 'unknown'));
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
        if (err) { reject(new HealthDataError('getDailyStepCountSamples: ' + JSON.stringify(err), 'unknown')); return; }
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
    throw new HealthDataError('Health Connect module unavailable (Expo Go)', 'unavailable');
  }

  const { initialize, requestPermission, readRecords } = HealthConnect;

  // Initialize Health Connect SDK (required before any other call). Shared with
  // useHealthHistory so both hooks don't each trigger their own init call.
  const available = await initHealthConnectOnce(initialize);
  if (!available) throw new HealthDataError('Health Connect not available on this device', 'unavailable');

  // Request read permission for Steps
  const granted = await requestPermission([
    { accessType: 'read', recordType: HEALTH_CONNECT_STEPS_RECORD },
  ]);
  if (!granted.length) throw new HealthDataError('Health Connect permission denied', 'permission-denied');

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
    errorKind: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null, errorKind: null }));
    try {
      let data: Pick<HealthState, 'todaySteps' | 'monthHistory' | 'hasPermission'>;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new HealthDataError('HealthKit fetch timed out (simulator?)', 'unavailable')), 5000)
      );
      if (Platform.OS === 'ios') {
        data = await Promise.race([fetchIOS(), timeoutPromise]);
      } else {
        data = await fetchAndroid();
      }
      setState({ ...data, isMockData: false, isLoading: false, error: null, errorKind: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const kind: HealthErrorKind = err instanceof HealthDataError ? err.kind : 'unknown';

      if (kind === 'unavailable') {
        // Dev-time stand-in only: no native module/device to read real steps from.
        const mock = buildMockHistory();
        setState({
          todaySteps: mock[mock.length - 1]?.steps ?? 0,
          monthHistory: mock,
          hasPermission: false,
          isMockData: true,
          isLoading: false,
          error: message,
          errorKind: kind,
        });
        return;
      }

      // Permission denied or a genuine unexpected error — never fabricate steps for these.
      setState({
        todaySteps: 0,
        monthHistory: [],
        hasPermission: false,
        isMockData: false,
        isLoading: false,
        error: message,
        errorKind: kind,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
