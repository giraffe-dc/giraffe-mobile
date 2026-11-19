import { useEffect, useState } from 'react';
import { Stack, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import * as Application from 'expo-application';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fetchAppVersion, type AppVersion } from '../src/api/client';
import { CatalogProvider } from '../src/providers/CatalogProvider';
import { BookingProvider } from '../src/store/bookingStore';
import { UpdateModal } from '../src/components/UpdateModal';
import { COLORS } from '../src/constants/theme';

/** Назви документів для web-експорту (PWA: <title> у статичних HTML). */
const TITLES: Record<string, string> = {
  index: 'Жирафик — каталог свят і бронювання',
  services: 'Послуги — Жирафик',
  packages: 'Пакети — Жирафик',
  booking: 'Бронювання — Жирафик',
  contacts: 'Контакти — Жирафик',
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
      <CatalogProvider>
        <BookingProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.paper },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="details" options={{ headerShown: false }} />
          </Stack>
          <UpdateModal version={update} onClose={() => setUpdate(null)} />
        </BookingProvider>
      </CatalogProvider>
    </SafeAreaProvider>
  );
}
