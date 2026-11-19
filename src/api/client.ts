import { ENDPOINTS } from '../constants/config';
import { FALLBACK_CATALOG } from '../data/fallbackCatalog';
import { normalizeCatalog } from './normalize';
import type { Catalog, OrderPayload } from '../types/catalog';

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

export interface OrderResult {
  ok: boolean;
  error?: string;
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

    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Сервіс тимчасово недоступний' };
  } catch {
    return { ok: false, error: 'Немає з\'єднання з інтернетом. Спробуйте ще раз.' };
  }
}
