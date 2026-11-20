/** Замовлення клієнта з GET /api/mobile/orders (кабінет, Етап 3).
 *  Статуси — реальні, які використовує адмінка сайту (ADM-02):
 *  нова → в роботі → підтверджена → виконано / скасована.
 *  Значення поза списком показуємо як є (старі заявки можуть мати
 *  історичні статуси). */

export const ORDER_STATUSES = [
  'new',
  'in_progress',
  'confirmed',
  'done',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | (string & {});

export interface MyOrder {
  _id: string;
  customerName?: string;
  phone?: string;
  date?: string;
  time?: string;
  eventAddress?: string;
  eventType?: string;
  childrenCount?: number;
  notes?: string;
  serviceName?: string;
  packageName?: string;
  items?: Array<{
    serviceName: string;
    quantity?: number;
    price?: string;
  }>;
  status?: OrderStatus;
  createdAt?: string;
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'Нова',
  in_progress: 'В роботі',
  confirmed: 'Підтверджена',
  done: 'Виконано',
  cancelled: 'Скасовано',
};

/** Тон бейджа для Pill (під палітру теми). */
export const STATUS_TONES: Record<string, 'green' | 'clay' | 'ochre' | 'plain'> = {
  new: 'ochre',
  in_progress: 'clay',
  confirmed: 'green',
  done: 'plain',
  cancelled: 'plain',
};

export function statusLabel(status?: string): string {
  if (!status) return STATUS_LABELS.new;
  return STATUS_LABELS[status] ?? status;
}

/** Невідомі/історичні статуси — нейтральний тон. */
export function statusTone(status?: string): 'green' | 'clay' | 'ochre' | 'plain' {
  return STATUS_TONES[status ?? 'new'] ?? 'plain';
}
