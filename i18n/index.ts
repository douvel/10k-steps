import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import en from './locales/en';
import fr from './locales/fr';

// Add new languages here as they become available — English stays the fallback
// for any device language we don't have a translation for yet.
const translations = { en, fr };

export type Locale = keyof typeof translations;
export const SUPPORTED_LOCALES = Object.keys(translations) as Locale[];

// A user can pin a specific locale from Settings, or leave it on 'system'
// to keep following the device language.
export type LocalePreference = Locale | 'system';
const STORAGE_KEY = '@10k_locale_preference';

function resolveDeviceLocale(): Locale {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED_LOCALES as string[]).includes(deviceLanguageCode)
    ? (deviceLanguageCode as Locale)
    : 'en';
}

const deviceLocale = resolveDeviceLocale();

let preference: LocalePreference = 'system';
let currentLocale: Locale = deviceLocale;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function applyPreference(pref: LocalePreference) {
  preference = pref;
  currentLocale = pref === 'system' ? deviceLocale : pref;
  notify();
}

AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
  if (stored === 'system' || (SUPPORTED_LOCALES as string[]).includes(stored ?? '')) {
    applyPreference(stored as LocalePreference);
  }
});

export async function setLocalePreference(pref: LocalePreference): Promise<void> {
  applyPreference(pref);
  await AsyncStorage.setItem(STORAGE_KEY, pref);
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getLocaleSnapshot(): Locale {
  return currentLocale;
}

function getPreferenceSnapshot(): LocalePreference {
  return preference;
}

function localeTagFor(locale: Locale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-US';
}

// Reactive hook — re-renders the calling component whenever the language changes.
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getLocaleSnapshot);
  const currentPreference = useSyncExternalStore(subscribe, getPreferenceSnapshot);
  return {
    locale,
    preference: currentPreference,
    localeTag: localeTagFor(locale),
    t: translations[locale],
    setLocalePreference,
  };
}
