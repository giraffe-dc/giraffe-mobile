import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { API_BASE } from '../constants/config';

/**
 * Push-нагадування (Етап 3, п. 3). Expo Push API + ендпоінт сайту
 * `/api/mobile/push-token`. На PWA (web) модуль не реєструється — iOS PWA
 * має власні обмеження, тому критичні події дублюються в чаті.
 */

const TOKEN_KEY = 'giraffe-push-token-v1';

let handlerConfigured = false;

function configureHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Запит дозволу + Expo push-токен. Повертає null, якщо користувач відмовив
 *  або ми у вебі. Токен кешується в AsyncStorage для повторної реєстрації. */
export async function registerPushToken(): Promise<string | null> {
  if (isWeb()) return null;
  configureHandler();
  try {
    const current = await Notifications.getPermissionsAsync();
    const granted =
      current.status === 'granted'
        ? current
        : await Notifications.requestPermissionsAsync();
    if (granted.status !== 'granted') return null;

    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await AsyncStorage.setItem(TOKEN_KEY, token.data);
    return token.data;
  } catch (error) {
    console.warn('push: не вдалося отримати токен', error);
    return null;
  }
}

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export async function cachedPushToken(): Promise<string | null> {
  if (isWeb()) return null;
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Надіслати токен на сайт (потрібен Bearer з кабінету). */
export async function syncPushToken(token: string, clientToken: string): Promise<boolean> {
  if (isWeb()) return false;
  try {
    const res = await fetch(`${API_BASE}/api/mobile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({ token, deviceId: 'expo' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Повний цикл після входу: дозвіл → токен → реєстрація на сайті. */
export async function enablePush(clientToken: string): Promise<void> {
  if (isWeb()) return;
  const token = await registerPushToken();
  if (token) await syncPushToken(token, clientToken);
}

export async function disablePush(clientToken: string): Promise<void> {
  if (isWeb()) return;
  const token = await cachedPushToken();
  if (!token) return;
  try {
    await fetch(
      `${API_BASE}/api/mobile/push-token?token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
  } catch {
    // ignore
  }
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Підписка на тап по сповіщенню. Повертає функцію відписки. */
export function onNotificationTap(
  handler: (data: Record<string, unknown>) => void,
): () => void {
  if (isWeb()) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data as Record<string, unknown>);
  });
  return () => sub.remove();
}
