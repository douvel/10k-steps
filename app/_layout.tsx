import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { initAnalytics, trackScreen } from '../utils/analytics';

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    initAnalytics().then(() => trackScreen(pathname));
  }, [pathname]);

  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
