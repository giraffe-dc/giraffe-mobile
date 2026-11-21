import AsyncStorage from '@react-native-async-storage/async-storage';

/** Згода користувача (Етап 4, Фаза A). Аналітика — opt-in (вимкнена за
 *  замовчуванням), push і гео — окремі перемикачі. Зберігається в AsyncStorage
 *  (на вебі — localStorage), текст політики — на сайті `/privacy`. */

export const PRIVACY_KEY = 'giraffe-privacy-consent-v1';

export interface PrivacyConsent {
  analytics: boolean;
  push: boolean;
  location: boolean;
  /** Порожній рядок = користувач ще не відповів на екран згоди. */
  updatedAt: string;
}

export const DEFAULT_CONSENT: PrivacyConsent = {
  analytics: false,
  push: false,
  location: false,
  updatedAt: '',
};

export function hasAnswered(consent: PrivacyConsent): boolean {
  return Boolean(consent.updatedAt);
}

export async function getPrivacyConsent(): Promise<PrivacyConsent> {
  try {
    const raw = await AsyncStorage.getItem(PRIVACY_KEY);
    if (!raw) return { ...DEFAULT_CONSENT };
    const parsed = JSON.parse(raw) as Partial<PrivacyConsent>;
    return {
      analytics: parsed.analytics === true,
      push: parsed.push === true,
      location: parsed.location === true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

export async function savePrivacyConsent(
  patch: Partial<Omit<PrivacyConsent, 'updatedAt'>>,
): Promise<PrivacyConsent> {
  const current = await getPrivacyConsent();
  const next: PrivacyConsent = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
  } catch {
    // приватний режим — тримаємо в пам'яті поточного сеансу
  }
  return next;
}
