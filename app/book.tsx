import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCatalog } from '../src/providers/CatalogProvider';
import { useBookingStore } from '../src/store/bookingStore';
import { COLORS } from '../src/constants/theme';
import type { CalcItem } from '../src/types/catalog';

/**
 * Мапінг параметрів бронювання в додаток — приймає ті самі параметри,
 * що й сайтівський `/book`:
 *   giraffe://book?service=…&package=…&packageName=…&format=…&items=[…]
 *   https://pwa…/book?service=… (PWA-версія)
 * Після застосування параметрів — одразу на форму бронювання.
 */
export default function BookDeepLinkScreen() {
  const router = useRouter();
  const { catalog, refreshing } = useCatalog();
  const { setSelection, setCalcItems, updateForm } = useBookingStore();
  const params = useLocalSearchParams<{
    service?: string;
    package?: string;
    packageName?: string;
    format?: string;
    programId?: string;
    items?: string;
  }>();
  const applied = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Чекаємо першого завантаження каталогу — щоб знайти послугу за id/назвою.
    if (applied.current || refreshing) return;
    applied.current = true;

    const serviceParam = typeof params.service === 'string' ? params.service.trim() : '';
    const packageId = typeof params.package === 'string' ? params.package.trim() : '';
    const packageName = typeof params.packageName === 'string' ? params.packageName : '';
    const format = typeof params.format === 'string' ? params.format : '';

    // 1) Пакет за id (як на сайті).
    if (packageId) {
      const pkg = catalog.packages.find((p) => p.id === packageId);
      if (pkg) {
        setSelection({
          kind: 'package',
          id: pkg.id,
          name: packageName || pkg.name,
          subtitle: pkg.period,
          format: pkg.format,
          priceLabel: pkg.price,
        });
      }
    }

    // 2) Послуга: спершу за id, потім за назвою (сайт передає назву).
    if (serviceParam && !packageId) {
      const byId = catalog.services.find((s) => s.id === serviceParam);
      const byTitle = catalog.services.find(
        (s) => s.title.trim().toLowerCase() === serviceParam.toLowerCase(),
      );
      const service = byId ?? byTitle;
      if (service) {
        const variant = service.variants[0];
        setSelection({
          kind: 'service',
          id: service.id,
          name: service.title,
          subtitle: variant?.label,
          format: service.format,
          price: variant?.price,
          variantId: variant?.id,
          variantLabel: variant?.label,
          variants: service.variants,
          image: service.images[0],
        });
      } else {
        // Не знайшли в каталозі — несемо назву в заявці (як сайт).
        setCalcItems([{ serviceId: '', serviceName: serviceParam }]);
      }
    }

    // 3) Позиції кошторису (`items` JSON — із калькулятора сайту).
    const rawItems = typeof params.items === 'string' ? params.items : '';
    if (rawItems) {
      try {
        const parsed = JSON.parse(rawItems) as CalcItem[];
        if (Array.isArray(parsed) && parsed.length) {
          setCalcItems(
            parsed.map((it) => ({
              serviceId: String(it.serviceId ?? ''),
              serviceName: String(it.serviceName ?? ''),
              price: it.price != null ? String(it.price) : undefined,
              quantity: typeof it.quantity === 'number' ? it.quantity : undefined,
            })),
          );
        }
      } catch {
        // некоректний JSON — ігноруємо
      }
    }

    // 4) Формат свята.
    if (format) updateForm({ eventType: format });

    setReady(true);
    router.replace('/(tabs)/booking');
  }, [refreshing, params, catalog, setSelection, setCalcItems, updateForm, router]);

  return (
    <View style={styles.container}>
      {ready ? null : <ActivityIndicator size="large" color={COLORS.green} />}
      <Text style={styles.text}>Відкриваємо бронювання…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center', gap: 14 },
  text: { fontSize: 14, color: COLORS.muted },
});
