import type { ServiceVariant } from '../types/catalog';

/** «1 500» — пробіли між розрядами без залежності від Intl у Hermes. */
export function formatMoney(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 90 → «1 год 30 хв», 60 → «1 год», 30 → «30 хв». */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} хв`;
  return rest > 0 ? `${hours} год ${rest} хв` : `${hours} год`;
}

/** Варіант рахується за штуки: `pricingUnit: "item"` або евристика сайту
 *  (немає тривалості і в підписі «шт/штук») — див. giraffe-site serviceVariants. */
export function isItemVariant(variant: Pick<ServiceVariant, 'pricingUnit' | 'durationMin' | 'label'>): boolean {
  if (variant.pricingUnit === 'item') return true;
  if (variant.pricingUnit === 'time') return false;
  const minutes = Number(variant.durationMin);
  return (!Number.isFinite(minutes) || minutes <= 0) && /шт|штук/i.test(variant.label ?? '');
}

/** Підписи категорій галереї (id з galleryContent.ts сайту). */
export const GALLERY_CATEGORY_LABELS: Record<string, string> = {
  shows: 'Шоу-програми',
  animators: 'Аніматори',
  mascots: 'Ростові ляльки',
  gaming: 'VR & PS4',
  workshops: 'Майстер-класи',
  teens: 'Підліткам',
  adults: 'Дорослим',
  seasonal: 'Сезонні',
  school: 'Школа та садок',
  other: 'Інше',
};

/**
 * Нормалізація введення до `+380XXXXXXXXX` (та сама логіка, що й на
 * сервері в clientAuth.normalizePhone). Повертає null, якщо це не
 * український мобільний — тоді форма показує підказку, а запит не йде.
 */
export function normalizePhone(raw: string): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  let national: string | null = null;
  if (digits.length === 12 && digits.startsWith('380')) national = digits.slice(3);
  else if (digits.length === 10 && digits.startsWith('0')) national = digits.slice(1);
  else if (digits.length === 9) national = digits;
  else if (digits.length === 11 && digits.startsWith('80')) national = digits.slice(2);
  if (!national || !/^[1-9]\d{8}$/.test(national)) return null;
  return `+380${national}`;
}

/** Живий маск-формат під час введення: «+38 (096) 123-45-67».
 *  Показуємо лише введені цифри після +380, щоб не заважати набору. */
export function formatPhoneInput(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '').replace(/^380?/, '');
  const n = digits.slice(0, 9);
  if (!n) return '';
  let out = '+380';
  if (n.length > 0) out += ` (${n.slice(0, 3)}`;
  if (n.length >= 3) out += ')';
  if (n.length > 3) out += ` ${n.slice(3, 6)}`;
  if (n.length > 6) out += `-${n.slice(6, 8)}`;
  if (n.length > 8) out += `-${n.slice(8, 9)}`;
  return out;
}

/** `+380671234567` → «+38 (067) 123-45-67» для показу в кабінеті. */
export function displayPhone(raw: string): string {
  const normalized = normalizePhone(raw);
  if (!normalized) return raw ?? '';
  return `+38 (${normalized.slice(3, 6)}) ${normalized.slice(6, 9)}-${normalized.slice(9, 11)}-${normalized.slice(11, 13)}`;
}
