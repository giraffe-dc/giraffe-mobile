import { Platform } from 'react-native';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../constants/config';
import { getPrivacyConsent } from './privacy';

/**
 * Власна аналітика воронки (Етап 4, Фаза A): події чергуються в AsyncStorage
 * і відсилаються батчем на `POST /api/mobile/events`. Жодної події без згоди
 * (прапорець `analytics` у налаштуваннях приватності). Збій мережі не
 * ламає застосунок — черга лишається до наступної спроби (макс. 100 подій).
 */

const QUEUE_KEY = 'giraffe-analytics-queue-v1';
const DEVICE_KEY = 'giraffe-analytics-device-v1';
const FLUSH_AT = 10;
const MAX_QUEUE = 100;

export interface AnalyticsEvent {
  event: string;
  ts: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  props?: Record<string, string | number>;
}

function newId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === 'function') return g.crypto.randomUUID();
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

async function deviceId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = newId();
      await AsyncStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return newId();
  }
}

async function readQueue(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    return Array.isArray(parsed) ? parsed.slice(-MAX_QUEUE) : [];
  } catch {
    return [];
  }
}

async function writeQueue(events: AnalyticsEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE)));
  } catch {
    // ignore
  }
}

/** Нічого не збираємо, якщо користувач не дав згоду на аналітику. */
export async function track(
  event: string,
  props: Record<string, string | number> = {},
): Promise<void> {
  const consent = await getPrivacyConsent();
  if (!consent.analytics) return;
  const item: AnalyticsEvent = {
    event,
    ts: new Date().toISOString(),
    deviceId: await deviceId(),
    platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
    appVersion: String(Application.nativeApplicationVersion ?? 'pwa').slice(0, 20),
    ...(Object.keys(props).length ? { props } : {}),
  };
  const queue = await readQueue();
  await writeQueue([...queue, item]);
  if (queue.length + 1 >= FLUSH_AT) await flushAnalytics();
}

export async function flushAnalytics(): Promise<void> {
  const consent = await getPrivacyConsent();
  if (!consent.analytics) {
    await clearAnalyticsQueue();
    return;
  }
  const queue = await readQueue();
  if (!queue.length) return;
  try {
    const res = await fetch(ENDPOINTS.mobileEvents, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ events: queue }),
    });
    if (!res.ok) return; // лишаємо чергу для повтору
    await clearAnalyticsQueue();
  } catch {
    // без мережі — черга збережена, повторимо пізніше
  }
}

export async function clearAnalyticsQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch {
    // ignore
  }
}
