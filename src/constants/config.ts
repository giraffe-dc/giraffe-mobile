/** Єдина точка конфігурації backend-у сайту «Жирафик».
 *  Для локальної розробки: EXPO_PUBLIC_API_BASE=http://localhost:3000 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'https://giraffe-teplyk.vercel.app';

export const ENDPOINTS = {
  catalog: `${API_BASE}/api/mobile/catalog`,
  version: `${API_BASE}/api/mobile/version`,
  contacts: `${API_BASE}/api/data/contacts`,
  offers: `${API_BASE}/api/data/offers`,
  news: `${API_BASE}/api/data/news`,
  orders: `${API_BASE}/api/orders`,
  reviews: `${API_BASE}/api/reviews`,
  /** Кабінет клієнта (Етап 3): OTP через Telegram + мої заявки. */
  authRequestCode: `${API_BASE}/api/mobile/auth/request-code`,
  authVerify: `${API_BASE}/api/mobile/auth/verify`,
  myOrders: `${API_BASE}/api/mobile/orders`,
  busyDates: `${API_BASE}/api/mobile/busy-dates`,
} as const;

/** `/api/media/<id>` віддає байти з БД або редірект на CDN. */
export function mediaUrl(idOrPath: string, width = 800): string {
  if (!idOrPath) return '';
  if (/^https?:\/\//i.test(idOrPath)) return idOrPath;
  const id = idOrPath.replace(/^\/api\/media\//, '').replace(/^\//, '');
  return `${API_BASE}/api/media/${id}?w=${width}`;
}

export const PHONE = '+38 (096) 187-85-79';
export const TEL = '+380961878579';
export const EMAIL = 'giraffe.teplik@gmail.com';
export const HOURS = 'щодня з 09:00 до 21:00';
