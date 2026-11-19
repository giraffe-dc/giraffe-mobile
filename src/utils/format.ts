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
