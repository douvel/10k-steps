import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_DAILY_GOAL } from '../constants/health';

const STORAGE_KEY = '@step_goal_daily';

export function useStepGoal() {
  const [dailyGoal, setDailyGoal] = useState<number>(DEFAULT_DAILY_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored !== null) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) setDailyGoal(parsed);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveGoal = useCallback(async (goal: number) => {
    if (goal <= 0 || isNaN(goal)) return;
    setDailyGoal(goal);
    await AsyncStorage.setItem(STORAGE_KEY, String(goal));
  }, []);

  return { dailyGoal, saveGoal, isLoading };
}
