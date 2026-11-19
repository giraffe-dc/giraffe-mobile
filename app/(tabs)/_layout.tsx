import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';

const tabIcon = (active: string, passive: string) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={(focused ? active : passive) as keyof typeof Ionicons.glyphMap} size={23} color={color} />
  );

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Головна', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="services" options={{ title: 'Послуги', tabBarIcon: tabIcon('grid', 'grid-outline') }} />
      <Tabs.Screen name="packages" options={{ title: 'Пакети', tabBarIcon: tabIcon('gift', 'gift-outline') }} />
      <Tabs.Screen name="booking" options={{ title: 'Бронювання', tabBarIcon: tabIcon('calendar', 'calendar-outline') }} />
      <Tabs.Screen name="contacts" options={{ title: 'Контакти', tabBarIcon: tabIcon('call', 'call-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 22 : 12,
    height: 66,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderColor: COLORS.line,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 0 : 6,
    ...SHADOWS.card,
  },
  label: { fontSize: 10, fontWeight: '700' },
});
