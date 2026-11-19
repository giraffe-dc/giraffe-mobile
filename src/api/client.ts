import { ENDPOINTS } from '../constants/config';
import { FALLBACK_CATALOG } from '../data/fallbackCatalog';
import type {
  Catalog,
  OrderPayload,
  PartyPackage,
  Review,
  Service,
  SiteContacts,
} from '../types/catalog';

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

/** id категорій з `giraffe-site/src/components/board/categories.ts` → підписи. */
const CATEGORY_LABELS: Record<string, string> = {
  animators: 'Аніматорські програми',
  puppets: 'Ростові ляльки',
  shows: 'Шоу-програми',
  gaming: 'VR & PS4 / GAME PORTAL',
  workshops: 'Майстер-класи',
  extras: 'Святкові доповнення',
  seasonal: 'Сезонні (Новий рік)',
};

function published<T extends { published?: boolean }>(items: T[] | undefined): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.published !== false);
}

/** Приводимо відповідь `/api/mobile/catalog` до типу Catalog додатка. */
export function normalizeCatalog(payload: Json | null): Catalog | null {
  if (!payload?.sections) return null;
  const s = payload.sections as Json;

  const services: Service[] = published<Service>(s.services?.services).map((item) => ({
    ...item,
    id: String(item.id ?? ''),
    title: String(item.title ?? ''),
    desc: String(item.desc ?? ''),
    category: CATEGORY_LABELS[String(item.category ?? '')] ?? String(item.category ?? 'Інше'),
    format: String(item.format ?? 'Інше'),
    audiences: Array.isArray(item.audiences) ? item.audiences : [],
    images: Array.isArray(item.images) ? item.images : [],
    requirements: Array.isArray(item.requirements) ? item.requirements : [],
    variants: Array.isArray(item.variants) ? item.variants : [],
  }));

  const packages: PartyPackage[] = published<PartyPackage>(s.packages?.packages).map((item) => ({
    ...item,
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    price: String(item.price ?? ''),
    period: String(item.period ?? ''),
    sub: String(item.sub ?? ''),
    items: Array.isArray(item.items) ? item.items : [],
    format: String(item.format ?? 'Комбо-програма'),
    audiences: Array.isArray(item.audiences) ? item.audiences : [],
  }));

  const reviews: Review[] = Array.isArray(payload.reviews)
    ? payload.reviews.map((r: Json, i: number) => ({
        id: String(r.id ?? `api-${i}`),
        stars: String(r.stars ?? '★★★★★'),
        rating: Number(r.rating ?? 5),
        quote: String(r.quote ?? ''),
        initial: String(r.initial ?? ''),
        name: String(r.name ?? ''),
        context: String(r.context ?? ''),
        avatar: String(r.avatar ?? ''),
      }))
    : [];

  // Актуальні контакти лежать у секції site_content (як і на сайті),
  // а не в застарілій колекції /api/data/contacts.
  const sc = s.contacts?.contacts ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const contacts: SiteContacts = {
    phone: str(sc.phone) ?? FALLBACK_CATALOG.contacts.phone,
    tel: str(sc.tel) ?? FALLBACK_CATALOG.contacts.tel,
    email: str(sc.email) ?? FALLBACK_CATALOG.contacts.email,
    hours: str(sc.hours) ?? FALLBACK_CATALOG.contacts.hours,
    address: str(sc.address) ?? FALLBACK_CATALOG.contacts.address,
    whatsapp: str(sc.whatsapp),
    telegram: str(sc.telegram),
    facebook: str(sc.facebook),
    instagram: str(sc.instagram),
    tiktok: str(sc.tiktok),
  };

  return {
    source: 'api',
    services: services.length ? services : FALLBACK_CATALOG.services,
    packages: packages.length ? packages : FALLBACK_CATALOG.packages,
    reviews: reviews.length ? reviews : FALLBACK_CATALOG.reviews,
    timeline: Array.isArray(s.timeline?.timeline) && s.timeline.timeline.length
      ? s.timeline.timeline
      : FALLBACK_CATALOG.timeline,
    promises: Array.isArray(s.promises?.promises) && s.promises.promises.length
      ? s.promises.promises
      : FALLBACK_CATALOG.promises,
    trust: Array.isArray(s.promises?.trust) && s.promises.trust.length
      ? s.promises.trust
      : FALLBACK_CATALOG.trust,
    hero: s.hero?.hero ?? FALLBACK_CATALOG.hero,
    contacts,
    serviceOptions: Array.isArray(s.calculator?.serviceOptions) && s.calculator.serviceOptions.length
      ? s.calculator.serviceOptions.map((o: unknown) => String(o).trim()).filter(Boolean)
      : FALLBACK_CATALOG.serviceOptions,
    galleryImages:
      Array.isArray(s.gallery?.albums) && s.gallery.albums.length
        ? s.gallery.albums
            .filter((a: Json) => a?.published !== false && a?.featured !== false)
            .flatMap((a: Json) => (Array.isArray(a.images) ? a.images : []))
            .filter((img: unknown) => typeof img === 'string' && !img.endsWith('.svg'))
            .slice(0, 12)
        : FALLBACK_CATALOG.galleryImages,
    roadNote: String(s.calculator?.roadNote ?? FALLBACK_CATALOG.roadNote),
  };
}

/** Каталог: живе API сайту, фолбек — реальний контент, знятий із сайту. */
export async function fetchCatalog(): Promise<Catalog> {
  const payload = await getJson(ENDPOINTS.catalog);
  return normalizeCatalog(payload) ?? FALLBACK_CATALOG;
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
