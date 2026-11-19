/**
 * Оновлює офлайн-знімок каталогу `src/data/fallbackCatalog.ts`
 * з живого API сайту (той самий JSON, що віддає /api/mobile/catalog).
 *
 *   node scripts/update-fallback.mjs [API_BASE]
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = process.argv[2] || 'https://giraffe-teplyk.vercel.app';
const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'src', 'data', 'fallbackCatalog.ts');

const res = await fetch(`${API_BASE}/api/mobile/catalog`, {
  headers: { Accept: 'application/json' },
});
if (!res.ok) {
  console.error(`API повернув ${res.status}`);
  process.exit(1);
}
const payload = await res.json();
if (!payload?.sections) {
  console.error('Відповідь без sections — знімок не оновлено');
  process.exit(1);
}

const json = JSON.stringify(payload, null, 2);
const content = `/**
 * Офлайн-копія реального контенту сайту (знімок site_content + reviews),
 * згенерована через GET /api/mobile/catalog (скрипт scripts/update-fallback.mjs).
 * Використовується тільки тоді, коли живе API недоступне (немає мережі
 * або ендпоінт ще не задеплоєний). НЕ редагуйте вручну.
 */
import { normalizeCatalog } from '../api/normalize';
import type { Catalog } from '../types/catalog';

const PAYLOAD: Record<string, unknown> = ${json};

const MINIMAL: Catalog = {
  source: 'fallback',
  services: [],
  packages: [],
  reviews: [],
  timeline: [],
  promises: [],
  trust: [],
  hero: null,
  contacts: {
    phone: '+38 (096) 187-85-79',
    tel: '+380961878579',
    email: 'giraffe.teplik@gmail.com',
    hours: 'щодня з 09:00 до 21:00',
  },
  serviceOptions: [],
  galleryImages: [],
  roadNote: '',
  faq: [],
  gallery: [],
  assistant: { kidsPerAnimator: 10, ageGroups: [], durations: [] },
  seasonal: null,
  calcNote: '',
  roadTariff: 25,
  roadFreeKm: 0,
};

/** Той самий конвеєр, що й для живого API, — офлайн поводиться однаково. */
export const FALLBACK_CATALOG: Catalog = {
  ...(normalizeCatalog(PAYLOAD) ?? MINIMAL),
  source: 'fallback',
};
`;

writeFileSync(outFile, content, 'utf8');
console.log(`ok: ${outFile} (${(content.length / 1024).toFixed(1)} KB)`);
