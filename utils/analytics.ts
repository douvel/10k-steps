import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Analytics produit anonyme (PostHog, hébergement UE).
// - Désactivé tant que EXPO_PUBLIC_POSTHOG_KEY n'est pas défini (dev, tests).
// - Aucun identifiant utilisateur, aucune donnée de santé : ne JAMAIS passer de
//   nombre de pas ou de valeur HealthKit dans les propriétés d'un événement.
// - L'utilisateur peut se désinscrire depuis Réglages (persistant).

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
const OPT_OUT_KEY = '@10k_analytics_opt_out';

let client: PostHog | null = null;
let optedOut = false;
let ready: Promise<void> | null = null;

export function initAnalytics(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    try {
      optedOut = (await AsyncStorage.getItem(OPT_OUT_KEY)) === '1';
      if (!API_KEY) return;
      client = new PostHog(API_KEY, {
        host: HOST,
        defaultOptIn: !optedOut,
        captureAppLifecycleEvents: true,
        persistence: 'file',
      });
    } catch {
      client = null; // l'analytics ne doit jamais casser l'app
    }
  })();
  return ready;
}

export function track(event: string, properties?: Record<string, string | number | boolean>) {
  if (optedOut || !client) return;
  try {
    client.capture(event, properties);
  } catch {}
}

export function trackScreen(name: string) {
  if (optedOut || !client) return;
  try {
    client.screen(name);
  } catch {}
}

export function isAnalyticsEnabled(): boolean {
  return !optedOut;
}

export async function setAnalyticsEnabled(enabled: boolean) {
  optedOut = !enabled;
  await AsyncStorage.setItem(OPT_OUT_KEY, enabled ? '0' : '1');
  try {
    if (enabled) await client?.optIn();
    else await client?.optOut();
  } catch {}
}
