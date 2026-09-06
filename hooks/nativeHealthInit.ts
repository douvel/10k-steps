import { HEALTHKIT_PERMISSIONS } from '../constants/health';
import type AppleHealthKitModule from 'react-native-health';
import type { HealthKitPermissions } from 'react-native-health';

// useHealthData and useHealthHistory both need HealthKit/Health Connect initialised
// before reading anything, and HealthDataContext mounts both hooks together — without
// sharing the in-flight init promise here, every mount/refresh triggers two separate
// native init/permission round trips instead of one.

export class HealthInitError extends Error {
  timedOut: boolean;
  constructor(message: string, timedOut: boolean) {
    super(message);
    this.timedOut = timedOut;
  }
}

let iosInitPromise: Promise<void> | null = null;

export function initHealthKitOnce(AppleHealthKit: typeof AppleHealthKitModule): Promise<void> {
  if (!iosInitPromise) {
    iosInitPromise = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new HealthInitError('HealthKit init timed out', true)),
        5000,
      );
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS as unknown as HealthKitPermissions, (err) => {
        clearTimeout(timer);
        // Some versions pass err="null" (string) or {} (empty object) on success — treat those as success
        const realError =
          err &&
          err !== 'null' &&
          !(typeof err === 'object' && Object.keys(err as object).length === 0);
        if (realError) reject(new HealthInitError('HealthKit init: ' + JSON.stringify(err), false));
        else resolve();
      });
    }).finally(() => {
      iosInitPromise = null;
    });
  }
  return iosInitPromise;
}

let androidInitPromise: Promise<boolean> | null = null;

export function initHealthConnectOnce(initialize: () => Promise<boolean>): Promise<boolean> {
  if (!androidInitPromise) {
    androidInitPromise = initialize().finally(() => {
      androidInitPromise = null;
    });
  }
  return androidInitPromise;
}
