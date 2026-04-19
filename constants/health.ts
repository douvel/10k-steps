// HealthKit permissions requested on iOS
export const HEALTHKIT_PERMISSIONS = {
  permissions: {
    read: ['StepCount'],
    write: [] as string[],
  },
};

// Health Connect record type for Android
export const HEALTH_CONNECT_STEPS_RECORD = 'Steps';

// Default daily step goal if not configured
export const DEFAULT_DAILY_GOAL = 10_000;

// Number of days to look back for monthly history (max 31)
export const HISTORY_DAYS = 31;
