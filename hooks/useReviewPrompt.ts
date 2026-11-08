import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { shouldRequestReview, ReviewPromptState } from '../utils/reviewPrompt';

const STORAGE_KEY = 'reviewPromptState';

async function loadState(): Promise<ReviewPromptState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ReviewPromptState;
  } catch {
    // état illisible : on repart de zéro
  }
  return { lastPromptAt: null, promptCount: 0 };
}

/** Demande un avis App Store quand l'objectif du mois est atteint (voir utils/reviewPrompt.ts). */
export function useReviewPrompt(monthDone: boolean) {
  useEffect(() => {
    if (!monthDone) return;
    let cancelled = false;
    (async () => {
      try {
        const state = await loadState();
        const now = Date.now();
        if (cancelled || !shouldRequestReview(state, monthDone, now)) return;
        if (!(await StoreReview.hasAction())) return;
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ lastPromptAt: now, promptCount: state.promptCount + 1 }),
        );
        await StoreReview.requestReview();
      } catch {
        // la demande d'avis ne doit jamais perturber l'app
      }
    })();
    return () => { cancelled = true; };
  }, [monthDone]);
}
