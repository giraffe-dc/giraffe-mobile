import { API_BASE, ENDPOINTS } from '../constants/config';
import { FALLBACK_CATALOG } from '../data/fallbackCatalog';
import { normalizeCatalog } from './normalize';
import type { Catalog, OrderPayload } from '../types/catalog';
import type { MyOrder } from '../types/orders';

export { normalizeCatalog };

const TIMEOUT = 9000;

type Json = Record<string, any>;

async function getJson(url: string, timeout = TIMEOUT): Promise<Json | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as Json;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Живий API + офлайн-знімок по секціях: порожні списки підміняємо фолбеком. */
function withFallback(live: Catalog): Catalog {
  const fb = FALLBACK_CATALOG;
  const pick = <T>(value: T[], fallback: T[]) => (value.length ? value : fallback);
  return {
    ...live,
    services: pick(live.services, fb.services),
    packages: pick(live.packages, fb.packages),
    reviews: pick(live.reviews, fb.reviews),
    timeline: pick(live.timeline, fb.timeline),
    promises: pick(live.promises, fb.promises),
    trust: pick(live.trust, fb.trust),
    hero: live.hero ?? fb.hero,
    contacts: live.contacts.phone ? live.contacts : fb.contacts,
    faq: pick(live.faq, fb.faq),
    gallery: pick(live.gallery, fb.gallery),
    seasonal: live.seasonal ?? fb.seasonal,
  };
}

/** Каталог: живе API сайту, фолбек — реальний контент, знятий із сайту. */
export async function fetchCatalog(): Promise<Catalog> {
  const payload = await getJson(ENDPOINTS.catalog);
  const normalized = normalizeCatalog(payload);
  return normalized ? withFallback(normalized) : FALLBACK_CATALOG;
}

export interface Offer {
  _id?: string;
  title: string;
  description?: string;
  icon?: string;
}

export async function fetchOffers(): Promise<Offer[]> {
  const data = await getJson(ENDPOINTS.offers);
  return Array.isArray(data) ? (data as Offer[]) : [];
}

export interface NewsItem {
  _id?: string;
  title: string;
  content?: string;
  date?: string;
  type?: string;
  /** Опитування, прикріплене до новини (створюється в адмінці сайту). */
  survey?: Survey;
}

export interface Survey {
  question: string;
  options?: Array<{ id: string; text: string }>;
  allowMultiple?: boolean;
  endDate?: string;
  fields?: Array<{ id: string; label: string }>;
}

export interface SurveyResults {
  totalVotes: number;
  optionResults: Record<string, number>;
  lastVoteAt?: string | null;
}

/** Відповідь на опитування (free-form поля) — /api/survey/submit. */
export async function submitSurvey(
  newsId: string,
  answers: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/survey/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ newsId, answers }),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Не вдалося надіслати відповідь' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом' };
  }
}

/** Голос за варіанти — /api/survey/vote. */
export async function voteSurvey(
  newsId: string,
  optionIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/survey/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ newsId, optionIds }),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Не вдалося проголосувати' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом' };
  }
}

/** Проміжні результати опитування (публічні, без персональних даних). */
export async function fetchSurveyResults(newsId: string): Promise<SurveyResults | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/survey/results?newsId=${encodeURIComponent(newsId)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as SurveyResults;
    return body && typeof body.totalVotes === 'number' ? body : null;
  } catch {
    return null;
  }
}

export async function fetchNews(): Promise<NewsItem[]> {
  const data = await getJson(ENDPOINTS.news);
  return Array.isArray(data) ? (data as NewsItem[]).slice(0, 5) : [];
}

export interface AppVersion {
  versionName: string;
  versionCode: number;
  changelog: string[];
  publishedAt: string;
  sha256?: string;
  apkUrl: string;
}

/** Версія APK з сайту — для перевірки оновлень у встановленому додатку. */
export async function fetchAppVersion(): Promise<AppVersion | null> {
  const data = await getJson(ENDPOINTS.version, 6000);
  if (!data || typeof data.versionCode !== 'number') return null;
  return {
    versionName: String(data.versionName ?? ''),
    versionCode: data.versionCode,
    changelog: Array.isArray(data.changelog) ? data.changelog.map(String) : [],
    publishedAt: String(data.publishedAt ?? ''),
    sha256: typeof data.sha256 === 'string' ? data.sha256 : undefined,
    apkUrl: String(data.apkUrl ?? 'https://github.com/giraffe-dc/newSite/releases/latest'),
  };
}

/* ── Чат із командою (Етап 3, п. 6) ─────────────────────────────────── */

export interface ChatMessage {
  id: string;
  role: 'client' | 'operator' | 'user' | 'admin' | 'system';
  content: string;
  author?: string;
  adminName?: string;
  channel?: string;
  createdAt?: string;
}

/** threadId — capability для читання історії (16–80 символів [A-Za-z0-9_-]). */
export function makeThreadId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === 'function') return g.crypto.randomUUID();
  // Hermes може не мати randomUUID — змішуємо час і випадковість (достатньо
  // для випадкового ідентифікатора діалогу, паролем він не є).
  const rand = () => Math.floor(Math.random() * 0xffffffff).toString(36);
  return `m_${Date.now().toString(36)}_${rand()}${rand()}${rand()}`;
}

export async function sendChatMessage(input: {
  threadId: string;
  deviceId: string;
  text: string;
  clientName?: string;
  clientPhone?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(ENDPOINTS.chatMessage, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...input, deviceInfo: { platform: 'mobile' } }),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Не вдалося надіслати повідомлення' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом' };
  }
}

/** Нові відповіді операторів (poll кожні 6–8 с, тільки поки екран відкритий). */
export async function pollChat(threadId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(
      `${ENDPOINTS.chatPoll}?threadId=${encodeURIComponent(threadId)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { messages?: ChatMessage[] };
    return Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return [];
  }
}

export async function fetchChatHistory(threadId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(
      `${ENDPOINTS.chatHistory}?threadId=${encodeURIComponent(threadId)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { messages?: ChatMessage[] };
    return Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return [];
  }
}

/** Публічні зайняті дати (лише попередження, never блокування).
 *  Помилка/немає зв'язку → порожній список: календар працює далі. */
export async function fetchBusyDates(): Promise<string[]> {
  const data = await getJson(ENDPOINTS.busyDates, 6000);
  if (!data || !Array.isArray(data.dates)) return [];
  return data.dates.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
}

/* ── Кабінет клієнта (Етап 3) ───────────────────────────────────────── */

/** Сервер повертає короткі англійські коди помилок — показуємо українською. */
const AUTH_ERRORS: Record<string, string> = {
  'Invalid phone': 'Невірний номер телефону. Введіть український мобільний.',
  'Invalid code': 'Код має складатися з 6 цифр.',
  'Wrong code': 'Невірний код. Спробуйте ще раз.',
  'Code expired': 'Код застарів. Запросіть новий.',
  'Too many attempts': 'Занадто багато невдалих спроб. Запросіть новий код.',
  'Confirmation required': 'Підтвердьте вхід у Telegram-боті.',
  'Too many requests': 'Занадто багато запитів. Зачекайте трохи.',
  'Telegram unavailable': 'Бот тимчасово недоступний. Спробуйте пізніше.',
  'Telegram not configured': 'Бот для входу не налаштований. Зв\'яжіться з підтримкою.',
  'Failed to create code': 'Не вдалося створити код. Спробуйте пізніше.',
  'Verification failed': 'Не вдалося перевірити код. Спробуйте пізніше.',
};

function authError(code?: string, fallback?: string): string {
  return (code && AUTH_ERRORS[code]) || fallback || 'Спробуйте ще раз.';
}

/** Відповідь запиту коду: або код уже в Telegram (bound), або deep link
 *  для першого входу (link) — тоді додаток відкриває бота. */
export interface CodeRequestResult {
  ok: boolean;
  delivery?: 'telegram' | 'link';
  mask?: string;
  link?: string;
  expiresInSec?: number;
  error?: string;
  hint?: string;
}

/** Крок 1: запросити код. Код НІКОЛИ не повертається у відповіді. */
export async function requestCode(phone: string): Promise<CodeRequestResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(ENDPOINTS.authRequestCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ phone }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const body = (await res.json().catch(() => null)) as CodeRequestResult | null;
    if (res.ok && body?.ok) return body;
    return {
      ok: false,
      error: authError(body?.error, 'Не вдалося запросити код'),
      hint: body?.hint,
    };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом. Спробуйте ще раз.' };
  }
}

export interface VerifyResult {
  ok: boolean;
  token?: string;
  phone?: string;
  attemptsLeft?: number;
  error?: string;
  hint?: string;
}

/** Крок 2: підтвердити код. Без `code` — після deep link у Telegram
 *  (додаток опитує, поки клієнт не підтвердить вхід у боті). */
export async function verifyCode(phone: string, code?: string): Promise<VerifyResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(ENDPOINTS.authVerify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ phone, ...(code ? { code } : {}) }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const body = (await res.json().catch(() => null)) as VerifyResult | null;
    if (res.ok && body?.token) {
      return { ok: true, token: body.token, phone: body.phone };
    }
    return {
      ok: false,
      error: authError(body?.error, 'Не вдалося підтвердити код'),
      hint: body?.hint,
      attemptsLeft: body?.attemptsLeft,
    };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом. Спробуйте ще раз.' };
  }
}

/** Список заявок клієнта. Помилка (401/мережа) повертає null — тоді
 *  провайдер розлогінює або показує «немає зв'язку». */
export async function fetchMyOrders(token: string): Promise<MyOrder[] | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(ENDPOINTS.myOrders, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const body = (await res.json()) as { orders?: unknown };
    if (!Array.isArray(body?.orders)) return null;
    return body.orders as MyOrder[];
  } catch {
    return null;
  }
}

export interface OrderResult {
  ok: boolean;
  error?: string;
  /** id нової заявки (повертає /api/orders) — для майбутнього кабінету. */
  id?: string;
}

/** Публічний відгук → /api/reviews (статус `pending`, модерація в адмінці сайту). */
export async function submitReview(input: {
  name: string;
  text: string;
  rating: number;
  context?: string;
}): Promise<OrderResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(ENDPOINTS.reviews, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Не вдалося надіслати відгук' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом. Спробуйте ще раз.' };
  }
}

/** Заявка йде напряму в /api/orders сайту (Telegram + збереження в MongoDB). */
export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(ENDPOINTS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) {
      const body = (await res.json().catch(() => null)) as {
        success?: boolean;
        id?: string;
      } | null;
      return { ok: true, id: typeof body?.id === 'string' ? body.id : undefined };
    }
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Сервіс тимчасово недоступний' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом. Спробуйте ще раз.' };
  }
}
