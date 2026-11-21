import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fetchAppVersion, type AppVersion } from '../src/api/client';
import { CatalogProvider } from '../src/providers/CatalogProvider';
import { BookingProvider } from '../src/store/bookingStore';
import { AuthProvider } from '../src/providers/AuthProvider';
import { PrivacyProvider } from '../src/providers/PrivacyProvider';
import { AccessibilityProvider } from '../src/providers/AccessibilityProvider';
import { onNotificationTap } from '../src/services/push';
import { flushAnalytics } from '../src/services/analytics';
import { ConsentGate } from '../src/components/ConsentGate';
import { UpdateModal } from '../src/components/UpdateModal';
import { COLORS } from '../src/constants/theme';

/** Назви документів для web-експорту (PWA: <title> у статичних HTML). */
const TITLES: Record<string, string> = {
  index: 'Жирафик — каталог свят і бронювання',
  services: 'Послуги — Жирафик',
  packages: 'Пакети — Жирафик',
  booking: 'Бронювання — Жирафик',
  contacts: 'Контакти — Жирафик',
  cabinet: 'Кабінет — Жирафик',
  chat: 'Чат із командою — Жирафик',
  settings: 'Налаштування — Жирафик',
  details: 'Деталі програми — Жирафик',
};

function DocumentTitle() {
  const segments = useSegments();
  const last = segments.length ? segments[segments.length - 1] : 'index';
  const key = last === '(tabs)' ? 'index' : last;
  return (
    <Head>
      <title>{TITLES[key] ?? 'Жирафик — магістр свята'}</title>
    </Head>
  );
}

export default function RootLayout() {
  const [update, setUpdate] = useState<AppVersion | null>(null);
  const router = useRouter();

  // Тап по push — ведемо в потрібний розділ (тільки нативні пристрої).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    return onNotificationTap((data) => {
      const type = String(data?.type ?? '');
      if (type === 'review-request') router.replace('/chat');
      else router.replace('/(tabs)/cabinet');
    });
  }, [router]);

  // черга подій: раз на 30 с і при поверненні у застосунок
  useEffect(() => {
    const send = () => void flushAnalytics();
    const timer = setInterval(send, 30_000);
    const onState = (state: string) => {
      if (state === 'active') send();
    };
    const sub = AppState.addEventListener('change', onState);
    send();
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const current = Number.parseInt(String(Application.nativeBuildVersion ?? ''), 10);

    void fetchAppVersion().then((remote) => {
      if (!mounted || !remote || !Number.isFinite(current)) return;
      if (remote.versionCode > current) setUpdate(remote);
    });

    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <DocumentTitle />
      <StatusBar style="dark" backgroundColor={COLORS.paper} />
      <PrivacyProvider>
        <AccessibilityProvider>
          <CatalogProvider>
            <BookingProvider>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.paper },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="details" options={{ headerShown: false }} />
                  <Stack.Screen name="chat" options={{ headerShown: false }} />
                  <Stack.Screen name="settings" options={{ headerShown: false }} />
                </Stack>
                <UpdateModal version={update} onClose={() => setUpdate(null)} />
                <ConsentGate />
              </AuthProvider>
            </BookingProvider>
          </CatalogProvider>
        </AccessibilityProvider>
      </PrivacyProvider>
    </SafeAreaProvider>
  );
}
