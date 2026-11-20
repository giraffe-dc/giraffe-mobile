import * as Location from 'expo-location';

/**
 * Геолокація (Етап 3, п. 4): відстань від смт Теплик × тариф із каталогу.
 * ⚠️ Попередження про >40 км — НЕ блокування: заявка надсилається звичайно.
 */

/** Орієнтовний центр Теплика (Вінницька область). */
export const TEPLYK = { latitude: 48.7483, longitude: 29.2586 };

export interface DistanceResult {
  ok: boolean;
  km?: number;
  error?: string;
}

/** Haversine — відстань по прямій; для оцінки дороги достатньо. */
function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Запит дозволу й поточна відстань до Теплика. */
export async function distanceFromTeplyk(): Promise<DistanceResult> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    const permission =
      current.status === 'granted'
        ? current
        : await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return { ok: false, error: 'Дозвіл на геолокацію не надано' };
    }
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 300_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    const km = haversine(
      position.coords.latitude,
      position.coords.longitude,
      TEPLYK.latitude,
      TEPLYK.longitude,
    );
    return { ok: true, km: Math.round(km * 10) / 10 };
  } catch (error) {
    console.warn('geo: помилка', error);
    return { ok: false, error: 'Не вдалося визначити місцезнаходження' };
  }
}

/** Оцінка доплати за дорогу з урахуванням безкоштовних км із каталогу. */
export function estimateRoadCost(
  km: number,
  tariffPerKm: number,
  freeKm: number,
): number {
  const paid = Math.max(0, km - Math.max(0, freeKm));
  return Math.round(paid * Math.max(0, tariffPerKm));
}
