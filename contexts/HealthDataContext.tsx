import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useHealthData, HealthState } from '../hooks/useHealthData';
import { useHealthHistory, HealthHistoryState } from '../hooks/useHealthHistory';

// Fetches HealthKit/Health Connect data once and shares it across screens/tabs,
// instead of each screen mounting its own useHealthData/useHealthHistory and
// re-fetching every time its tab becomes active again.

interface HealthDataContextValue {
  data: HealthState & { refresh: () => void };
  history: HealthHistoryState & { refresh: () => void };
}

const HealthDataContext = createContext<HealthDataContextValue | null>(null);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const data = useHealthData();
  const history = useHealthHistory();

  // Steps recorded while the app was backgrounded aren't reflected until the next fetch —
  // refresh whenever the user returns to the app instead of only on mount / manual refresh.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        data.refresh();
        history.refresh();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [data.refresh, history.refresh]);

  return (
    <HealthDataContext.Provider value={{ data, history }}>
      {children}
    </HealthDataContext.Provider>
  );
}

export function useSharedHealthData() {
  const ctx = useContext(HealthDataContext);
  if (!ctx) throw new Error('useSharedHealthData must be used within a HealthDataProvider');
  return ctx.data;
}

export function useSharedHealthHistory() {
  const ctx = useContext(HealthDataContext);
  if (!ctx) throw new Error('useSharedHealthHistory must be used within a HealthDataProvider');
  return ctx.history;
}
