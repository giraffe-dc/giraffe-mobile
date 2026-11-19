/**
 * Нормалізація відповіді `/api/mobile/catalog` до типу Catalog додатка.
 * Окремий модуль (без імпорту fallback-знімка), щоб snapshot міг
 * проходити ту саму нормалізацію без циклічних імпортів.
 */
import type {
  AssistantSection,
  Catalog,
  FaqItem,
  GalleryAlbum,
  PartyPackage,
  Review,
  SeasonalOffer,
  Service,
  SiteContacts,
} from '../types/catalog';

type Json = Record<string, any>;

/** id категорій з `giraffe-site/src/components/board/categories.ts` → підписи. */
const CATEGORY_LABELS: Record<string, string> = {
  animators: 'Аніматорські програми',
  puppets: 'Ростові ляльки',
  shows: 'Шоу-програми',
  gaming: 'VR & PS4 / GAME PORTAL',
  workshops: 'Майстер-класи',
  extras: 'Святкові доповнення',
  seasonal: 'Сезонні (Новий рік)',
  teens: 'Підліткові вечірки',
  adults: 'Для дорослих',
  school: 'Школа та садок',
};

/** Дефолти, згодовані на сайті (використовуються, коли секції немає в БД). */
const DEFAULT_CONTACTS: SiteContacts = {
  phone: '+38 (096) 187-85-79',
  tel: '+380961878579',
  email: 'giraffe.teplik@gmail.com',
  hours: 'щодня з 09:00 до 21:00',
  address: 'вул. Суворова, 56, селище Теплик, Вінницька область.',
};

const DEFAULT_SERVICE_OPTIONS = ['Аніматори', 'Ростові ляльки', 'VR-окуляри', 'PlayStation 4', 'Комбо-програма'];

const DEFAULT_CALC_NOTE =
  'Сума орієнтовна: її рахуємо з базових цін послуг без урахування пакетних знижок і дороги.';

const DEFAULT_ROAD_NOTE =
  'Транспорт: 25 грн за кілометр в один бік від Теплика. Відстань і вартість уточнюється за адресою — остаточно підтвердить менеджер.';

const DEFAULT_ASSISTANT: AssistantSection = {
  kidsPerAnimator: 10,
  ageGroups: [
    { id: '0-3', label: 'Малюки (0–3)', refs: [] },
    { id: '4-6', label: 'Дошкільнята (4–6)', refs: [] },
    { id: '7-11', label: 'Школярики (7–11)', refs: [] },
    { id: '12-17', label: 'Підлітки (12–17)', refs: [] },
    { id: 'adults', label: 'Дорослі', refs: [] },
    { id: 'mixed', label: 'Різний вік', refs: [] },
  ],
  durations: [
    { min: 30, label: 'до 30 хв' },
    { min: 60, label: 'до 1 год' },
    { min: 90, label: 'до 1,5 год' },
    { min: 120, label: 'до 2 год' },
  ],
};

function published<T extends { published?: boolean }>(items: T[] | undefined): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.published !== false);
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
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
        quote: str(r.quote),
        initial: str(r.initial),
        name: str(r.name),
        context: str(r.context),
        avatar: str(r.avatar),
      }))
    : [];

  // Актуальні контакти лежать у секції site_content (як і на сайті),
  // а не в застарілій колекції /api/data/contacts.
  const sc = s.contacts?.contacts ?? {};
  const optional = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const contacts: SiteContacts = {
    phone: optional(sc.phone) ?? DEFAULT_CONTACTS.phone,
    tel: optional(sc.tel) ?? DEFAULT_CONTACTS.tel,
    email: optional(sc.email) ?? DEFAULT_CONTACTS.email,
    hours: optional(sc.hours) ?? DEFAULT_CONTACTS.hours,
    address: optional(sc.address) ?? DEFAULT_CONTACTS.address,
    whatsapp: optional(sc.whatsapp),
    telegram: optional(sc.telegram),
    facebook: optional(sc.facebook),
    instagram: optional(sc.instagram),
    tiktok: optional(sc.tiktok),
  };

  const faq: FaqItem[] = Array.isArray(s.faq?.faq)
    ? s.faq.faq
        .map((f: Json) => ({ q: str(f?.q), a: str(f?.a) }))
        .filter((f: FaqItem) => f.q && f.a)
    : [];

  const gallery: GalleryAlbum[] = published<GalleryAlbum>(s.gallery?.albums).map((a, i) => ({
    id: str(a.id, `album-${i}`),
    title: str(a.title, 'Альбом'),
    category: str(a.category, 'other'),
    summary: str(a.summary),
    serviceRef: str(a.serviceRef),
    serviceLabel: str(a.serviceLabel),
    images: Array.isArray(a.images) ? a.images.filter((x: unknown) => typeof x === 'string') : [],
    featured: a.featured === true,
    published: a.published !== false,
    videoUrl: str(a.videoUrl) || undefined,
  }));

  const rawAssistant = s.assistant as Json | undefined;
  const assistant: AssistantSection =
    rawAssistant && Array.isArray(rawAssistant.ageGroups) && rawAssistant.ageGroups.length
      ? {
          kidsPerAnimator: Number(rawAssistant.kidsPerAnimator) > 0 ? Number(rawAssistant.kidsPerAnimator) : 10,
          ageGroups: rawAssistant.ageGroups.map((g: Json) => ({
            id: str(g?.id),
            label: str(g?.label, 'Вік'),
            refs: Array.isArray(g?.refs) ? g.refs.map(String) : [],
            askManager: g?.askManager === true,
          })),
          durations: Array.isArray(rawAssistant.durations)
            ? rawAssistant.durations.map((d: Json) => ({ min: Number(d?.min) || 0, label: str(d?.label) }))
            : DEFAULT_ASSISTANT.durations,
        }
      : DEFAULT_ASSISTANT;

  const rawSeasonal = s.seasonalOffers as Json | undefined;
  const seasonal: SeasonalOffer | null =
    rawSeasonal && rawSeasonal.enabled !== false && str(rawSeasonal.title)
      ? {
          enabled: true,
          image: optional(rawSeasonal.image),
          imageAlt: optional(rawSeasonal.imageAlt),
          title: str(rawSeasonal.title),
          text: str(rawSeasonal.text),
          ctaLabel: optional(rawSeasonal.ctaLabel),
          ctaLink: optional(rawSeasonal.ctaLink),
        }
      : null;

  const calculator = s.calculator as Json | undefined;
  const serviceOptions: string[] =
    Array.isArray(calculator?.serviceOptions) && calculator.serviceOptions.length
      ? calculator.serviceOptions.map((o: unknown) => String(o).trim()).filter(Boolean)
      : DEFAULT_SERVICE_OPTIONS;

  const galleryImages: string[] =
    Array.isArray(s.gallery?.albums) && s.gallery.albums.length
      ? s.gallery.albums
          .filter((a: Json) => a?.published !== false && a?.featured !== false)
          .flatMap((a: Json) => (Array.isArray(a.images) ? a.images : []))
          .filter((img: unknown) => typeof img === 'string' && !img.endsWith('.svg'))
          .slice(0, 12)
      : [];

  return {
    source: 'api',
    services: services.length ? services : [],
    packages: packages.length ? packages : [],
    reviews: reviews.length ? reviews : [],
    timeline: Array.isArray(s.timeline?.timeline) && s.timeline.timeline.length ? s.timeline.timeline : [],
    promises: Array.isArray(s.promises?.promises) && s.promises.promises.length ? s.promises.promises : [],
    trust: Array.isArray(s.promises?.trust) && s.promises.trust.length ? s.promises.trust : [],
    hero: s.hero?.hero ?? null,
    contacts,
    serviceOptions,
    galleryImages,
    roadNote: str(calculator?.roadNote) || DEFAULT_ROAD_NOTE,
    faq,
    gallery,
    assistant,
    seasonal,
    calcNote: str(calculator?.calcNote) || DEFAULT_CALC_NOTE,
    roadTariff: typeof calculator?.roadTariff === 'number' ? calculator.roadTariff : 25,
    roadFreeKm: typeof calculator?.roadFreeKm === 'number' ? calculator.roadFreeKm : 0,
  };
}
