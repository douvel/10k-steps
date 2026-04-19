import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>{label}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="⬤" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="⚙" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  icon: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  iconFocused: {
    color: '#2563EB',
  },
});
