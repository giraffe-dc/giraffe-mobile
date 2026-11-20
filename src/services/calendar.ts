import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import type { MyOrder } from '../types/orders';

/**
 * Календар (Етап 3, п. 5): додати дату свята з нагадуванням за день.
 * На PWA (web) expo-calendar не працює — кнопка приховується, подію
 * можна додати вручну з деталей заявки.
 */

const CALENDAR_TITLE = 'Жирафик';

export interface CalendarResult {
  ok: boolean;
  error?: string;
}

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function calendarAvailable(): boolean {
  return !isWeb();
}

async function ensureCalendar(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(
    (c) => c.title === CALENDAR_TITLE && c.id !== null,
  );
  if (existing?.id) return existing.id;

  // Для створення календаря потрібен локальний source (iCloud/Exchange
  // можуть бути read-only). Без нього — просто не додаємо подію.
  const sources = await Calendar.getSourcesAsync();
  const source =
    sources.find((s) => s.type === Calendar.SourceType.LOCAL) ?? sources[0];
  if (!source?.id) return null;
  const id = await Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: '#1E5B3F',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source.id,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
    isVisible: true,
  });
  return id;
}

/** Додати подію «Свято — …» на дату заявки, з нагадуванням за 24 год. */
export async function addOrderToCalendar(order: MyOrder): Promise<CalendarResult> {
  if (isWeb()) {
    return { ok: false, error: 'Доступно у встановленому додатку' };
  }
  if (!order.date || !/^\d{4}-\d{2}-\d{2}$/.test(order.date)) {
    return { ok: false, error: 'У заявки немає точної дати' };
  }
  try {
    const current = await Calendar.getCalendarPermissionsAsync();
    const permission =
      current.status === 'granted'
        ? current
        : await Calendar.requestCalendarPermissionsAsync();
    if (permission.status !== 'granted') {
      return { ok: false, error: 'Дозвіл на календар не надано' };
    }

    const calendarId = await ensureCalendar();
    if (!calendarId) {
      return { ok: false, error: 'Не вдалося знайти календар для запису' };
    }

    const [y, m, d] = order.date.split('-').map(Number);
    const [hh, mm] = (order.time ?? '10:00').split(':').map(Number);
    const start = new Date(y, m - 1, d, hh || 10, mm || 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const title = `Свято — ${order.serviceName || order.packageName || order.eventType || 'Жирафик'}`;

    await Calendar.createEventAsync(calendarId, {
      title,
      startDate: start,
      endDate: end,
      location: order.eventAddress || undefined,
      notes: [
        `Заявка #${String(order._id).slice(-6).toUpperCase()}`,
        order.eventType ? `Привід: ${order.eventType}` : '',
        order.childrenCount ? `Дітей: ${order.childrenCount}` : '',
        'Команда «Жирафик» уточнить деталі телефоном.',
      ]
        .filter(Boolean)
        .join('\n'),
      alarms: [{ relativeOffset: -1440 }], // за 1 день
      timeZone: 'Europe/Kyiv',
    });
    return { ok: true };
  } catch (error) {
    console.warn('calendar: помилка', error);
    return { ok: false, error: 'Не вдалося додати подію в календар' };
  }
}
