export interface ServiceVariant {
  id: string;
  label: string;
  pricingUnit?: 'time' | 'item';
  durationMin: number;
  price: number;
}

/** Питання-відповідь із секції `faq` сайту. */
export interface FaqItem {
  q: string;
  a: string;
}

/** Альбом галереї (секція `gallery`): фото + прив'язка до послуги. */
export interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  summary: string;
  serviceRef: string;
  serviceLabel: string;
  images: string[];
  featured?: boolean;
  published?: boolean;
  videoUrl?: string;
}

/** Вікова група підбору програми (секція `assistant`). */
export interface AssistantAgeGroup {
  id: string;
  label: string;
  /** `service:<id>` / `package:<id>` — що підходить групі. */
  refs: string[];
  /** true — групі потрібна індивідуальна консультація менеджера. */
  askManager?: boolean;
}

export interface AssistantDuration {
  min: number;
  label: string;
}

export interface AssistantSection {
  kidsPerAnimator: number;
  ageGroups: AssistantAgeGroup[];
  durations: AssistantDuration[];
}

/** Сезонний банер (секція `seasonalOffers`). */
export interface SeasonalOffer {
  enabled: boolean;
  image?: string;
  imageAlt?: string;
  title: string;
  text: string;
  ctaLabel?: string;
  /** Шлях сайту, напр. `/services` — мапиться на маршрут додатка. */
  ctaLink?: string;
}

/** Елемент кошторису, зібраного в калькуляторі / підборі. */
export interface CalcItem {
  serviceId: string;
  serviceName: string;
  price?: string;
  quantity?: number;
}

export interface Service {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  category: string;
  audiences: string[];
  images: string[];
  imageAlt?: string;
  published?: boolean;
  showOnHome?: boolean;
  variants: ServiceVariant[];
  requirements: string[];
  calcLabel?: string;
  /** Базова ціна для кошторису, якщо немає варіантів. */
  calcValue?: number;
  format: string;
  price?: string;
  unit?: string;
}

export interface PackageItem {
  variantId?: string;
  qty?: number;
  text: string;
  /** Чи входить позиція в пакет (для показу «+» замість «−»). */
  included?: boolean;
}

export interface PartyPackage {
  id: string;
  name: string;
  sub: string;
  price: string;
  period: string;
  bundlePrice?: number;
  items: PackageItem[];
  hit?: boolean;
  format: string;
  audiences: string[];
  published?: boolean;
}

export interface Review {
  id: string;
  stars: string;
  rating: number;
  quote: string;
  initial: string;
  name: string;
  context: string;
  avatar: string;
}

export interface TimelineStep {
  time: string;
  title: string;
  text: string;
  on?: boolean;
}

export interface PromiseItem {
  ico: string;
  title: string;
  text: string;
}

export interface TrustItem {
  value: string;
  label: string;
}

export interface Hero {
  titleLead: string;
  titleAccent: string;
  titleTail: string;
  lead: string;
  cta: string;
  micro: Array<{ before: string; bold: string; after: string }>;
}

/** Секція `contacts` із `site_content` (редагується в /admin/content). */
export interface SiteContacts {
  phone: string;
  tel?: string;
  email: string;
  hours: string;
  address?: string;
  whatsapp?: string;
  telegram?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface Catalog {
  services: Service[];
  packages: PartyPackage[];
  reviews: Review[];
  timeline: TimelineStep[];
  promises: PromiseItem[];
  trust: TrustItem[];
  hero: Hero | null;
  contacts: SiteContacts;
  serviceOptions: string[];
  galleryImages: string[];
  roadNote: string;
  /** Питання секції FAQ. */
  faq: FaqItem[];
  /** Альбоми галереї (опубліковані). */
  gallery: GalleryAlbum[];
  /** Підбір програми за віком і тривалістю. */
  assistant: AssistantSection;
  /** Сезонний банер; null — вимкнений або відсутній. */
  seasonal: SeasonalOffer | null;
  /** Примітка під сумою кошторису. */
  calcNote: string;
  /** Тариф дороги, грн/км в один бік (налаштовується в адмінці сайту). */
  roadTariff: number;
  /** Скільки км безкоштовно (0 — платимо від першого км). */
  roadFreeKm: number;
  source: 'api' | 'fallback';
}

export interface OrderPayload {
  customerName: string;
  phone: string;
  date: string;
  time?: string;
  eventType: string;
  eventAddress?: string;
  childrenCount?: number;
  notes?: string;
  serviceName?: string;
  packageId?: string;
  packageName?: string;
  items?: Array<{
    serviceId?: string;
    serviceName: string;
    quantity?: number;
    price?: string;
  }>;
}
