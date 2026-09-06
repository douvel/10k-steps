import { Tabs } from 'expo-router';
import Svg, { Circle, Rect, Path, Polyline } from 'react-native-svg';
import { useLocale } from '../../i18n';

const ACCENT = '#FF5C2E';
const INACTIVE = 'rgba(255,255,255,0.3)';

function DashboardIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACCENT : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2" />
      <Polyline points="12 6 12 12 16 14" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function HistoryIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACCENT : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2" />
      <Path d="M3 9h18" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 3v6M16 3v6" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACCENT : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function TabsLayout() {
  const { t } = useLocale();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,15,0.97)',
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.dashboardTitle,
          tabBarLabel: t.tabs.dashboardLabel,
          tabBarIcon: ({ focused }) => <DashboardIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.tabs.historyTitle,
          tabBarLabel: t.tabs.historyLabel,
          tabBarIcon: ({ focused }) => <HistoryIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settingsTitle,
          tabBarLabel: t.tabs.settingsLabel,
          tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
