export interface ServiceVariant {
  id: string;
  label: string;
  pricingUnit?: 'time' | 'item';
  durationMin: number;
  price: number;
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
  format: string;
  price?: string;
  unit?: string;
}

export interface PackageItem {
  variantId?: string;
  qty?: number;
  text: string;
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
