import AsyncStorage from '@react-native-async-storage/async-storage';

// Shared by useHealthData/useHealthHistory: transient-failure retry and a small persisted
// cache so the dashboard can render last-known values instantly while a fresh fetch runs.

// HealthKit transiently fails with "Not authorized" / timeouts right after the app comes back
// to the foreground (protected data not yet available) or on a cold start. A short retry
// nearly always succeeds; an explicit permission denial is the only failure not worth retrying.
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if ((e as { kind?: string }).kind === 'permission-denied') break;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}
