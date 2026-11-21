import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyOrders, requestCode, verifyCode } from '../api/client';
import { getPrivacyConsent } from '../services/privacy';
import { disablePush, enablePush } from '../services/push';
import type { MyOrder } from '../types/orders';

/**
 * Кабінет клієнта (Етап 3). Токен зберігається в AsyncStorage (на.web —
 * localStorage) і шлеться як `Authorization: Bearer` — HttpOnly cookie
 * у React Native fetch не працює, тому основний шлях саме токен.
 *
 * Модель стану:
 *  - `hydrated` — токен завантажено зі сховища (щоб не мигнути гостем);
 *  - `pendingPhone` — номер, якому надіслано/відкрито код (екран коду);
 *  - `delivery: "link"` — демонструємо інструкцію «відкрий Telegram»,
 *    поки не підтвердиться deep link; далі verify без коду.
 */

const AUTH_KEY = 'giraffe-auth-v1';

interface SavedAuth {
  token: string;
  phone: string;
}

export interface AuthState {
  token: string | null;
  phone: string | null;
  hydrated: boolean;
  /** Номер у процесі входу (після requestCode). */
  pendingPhone: string | null;
  /** Як код доставлено: у боті (ввести вручну) або deep link. */
  delivery: 'telegram' | 'link' | null;
  mask: string | null;
  link: string | null;
  loading: boolean;
  error: string | null;
  /** Початковий крок: ввести телефон → запросити код. */
  startLogin: (phone: string) => Promise<boolean>;
  /** Ввести 6 цифр із Telegram або підтвердити deep link (code можна не передавати). */
  confirm: (code?: string) => Promise<boolean>;
  /** Скасувати вхід і повернутися до форми телефону. */
  cancelLogin: () => void;
  logout: () => void;
  /** Заявки поточного користувача (кеш у пам'яті екрана). */
  loadOrders: () => Promise<MyOrder[] | null>;
}

const AuthContext = createContext<AuthState | null>(null);

async function loadSaved(): Promise<SavedAuth | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAuth;
    return typeof parsed?.token === 'string' && typeof parsed?.phone === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
}

async function saveAuth(value: SavedAuth | null): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(value));
    else await AsyncStorage.removeItem(AUTH_KEY);
  } catch {
    // приватний режим / сховище недоступне — працюємо в пам'яті
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<'telegram' | 'link' | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Відновлення токена при старті (один раз, як у bookingStore).
  useEffect(() => {
    let mounted = true;
    void loadSaved().then((saved) => {
      if (!mounted) return;
      if (saved) {
        setToken(saved.token);
        setPhone(saved.phone);
        // Повторна реєстрація токена після перезапуску — ТІЛЬКИ за згодою.
        void getPrivacyConsent().then((consent) => {
          if (consent.push) void enablePush(saved.token);
        });
      }
      hydratedRef.current = true;
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      phone,
      hydrated,
      pendingPhone,
      delivery,
      mask,
      link,
      loading,
      error,
      startLogin: async (rawPhone: string) => {
        setError(null);
        setLoading(true);
        const result = await requestCode(rawPhone);
        setLoading(false);
        if (!result.ok) {
          setError(result.hint ?? result.error ?? 'Не вдалося запросити код');
          return false;
        }
        setPendingPhone(rawPhone);
        setDelivery(result.delivery ?? null);
        setMask(result.mask ?? null);
        setLink(result.link ?? null);
        return true;
      },
      confirm: async (code?: string) => {
        if (!pendingPhone) {
          setError('Спочатку введіть номер телефону');
          return false;
        }
        setError(null);
        setLoading(true);
        const result = await verifyCode(pendingPhone, code);
        setLoading(false);
        if (!result.ok || !result.token) {
          setError(result.hint ?? result.error ?? 'Код не підійшов');
          return false;
        }
        const next = { token: result.token, phone: result.phone ?? pendingPhone };
        setToken(next.token);
        setPhone(next.phone);
        setPendingPhone(null);
        setDelivery(null);
        setLink(null);
        await saveAuth(next);
        void getPrivacyConsent().then((consent) => {
          if (consent.push) void enablePush(next.token);
        });
        return true;
      },
      cancelLogin: () => {
        setPendingPhone(null);
        setDelivery(null);
        setLink(null);
        setMask(null);
        setError(null);
      },
      logout: () => {
        if (token) void disablePush(token);
        setToken(null);
        setPhone(null);
        setPendingPhone(null);
        setDelivery(null);
        setLink(null);
        setError(null);
        void saveAuth(null);
      },
      loadOrders: async () => {
        if (!token) return null;
        return fetchMyOrders(token);
      },
    }),
    [token, phone, hydrated, pendingPhone, delivery, mask, link, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth має використовуватися всередині AuthProvider');
  return ctx;
}
