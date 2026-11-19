import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../src/providers/CatalogProvider';
import { RemoteImage } from '../src/components/common';
import { useBookingStore } from '../src/store/bookingStore';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';

export default function DetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { kind, id } = useLocalSearchParams<{ kind?: string; id?: string }>();
  const { catalog } = useCatalog();
  const { setSelection } = useBookingStore();
  const [variantId, setVariantId] = useState<string | null>(null);

  const service = kind === 'service' ? catalog.services.find((s) => s.id === id) : undefined;
  const pack = kind === 'package' ? catalog.packages.find((p) => p.id === id) : undefined;
  const item = service ?? pack;

  if (!item) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.line} />
        <Text style={styles.missing}>Позицію не знайдено</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}><Text style={styles.backLinkText}>Назад</Text></Pressable>
      </View>
    );
  }

  const variants = service?.variants ?? [];
  const activeVariant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = activeVariant?.price ?? (pack ? Number(String(pack.price).replace(/[^\d]/g, '')) : undefined);

  const handleBook = () => {
    setSelection({
      kind: service ? 'service' : 'package',
      id: item.id,
      name: service ? service.title : pack!.name,
      subtitle: pack ? pack.period : activeVariant?.label,
      format: service?.format ?? pack?.format ?? 'Інше',
      price,
      priceLabel: pack?.price,
      variantId: activeVariant?.id,
      variantLabel: activeVariant?.label,
      variants,
      image: service?.images?.[0],
    });
    router.push('/(tabs)/booking');
  };

  const image = service?.images?.[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {image ? (
            <RemoteImage idOrPath={image} width={1200} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.imageFallback]}>
              <Text style={styles.imageEmoji}>{service?.emoji ?? '🎁'}</Text>
            </View>
          )}
          <Pressable style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.kicker}>{service ? service.category : 'Готовий комплекс'}</Text>
          <Text style={styles.title}>{service ? service.title : pack?.name}</Text>
          {pack?.sub ? <Text style={styles.sub}>{pack.sub}</Text> : null}
          {service?.audiences?.length ? (
            <View style={styles.audiences}>
              {service.audiences.map((a) => <View key={a} style={styles.audience}><Text style={styles.audienceText}>{a}</Text></View>)}
            </View>
          ) : null}

          <Text style={styles.desc}>{service?.desc ?? 'Готова програма з усього необхідного реквізиту, костюмів і ведучих. Команда приїжджає на вашу локацію.'}</Text>

          {variants.length > 0 ? (
            <>
              <Text style={styles.section}>Варіанти тривалості</Text>
              {variants.map((v) => {
                const active = v.id === activeVariant?.id;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => setVariantId(v.id)}
                    style={[styles.variant, active && styles.variantActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.variantLabel, active && styles.activeText]}>{v.label}</Text>
                      {v.durationMin ? <Text style={[styles.variantMeta, active && styles.activeText]}>{v.durationMin} хв</Text> : null}
                    </View>
                    <Text style={[styles.variantPrice, active && styles.activeText]}>{v.price} грн</Text>
                    {active ? <Ionicons name="checkmark-circle" size={20} color={COLORS.white} /> : null}
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {pack ? (
            <>
              <Text style={styles.section}>Що входить</Text>
              <View style={styles.listCard}>
                {pack.items.map((it, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Ionicons name="checkmark-circle" size={17} color={COLORS.green} />
                    <Text style={styles.bulletText}>{it.text}</Text>
                  </View>
                ))}
              </View>
              {pack.audiences?.length ? (
                <View style={styles.audiences}>
                  {pack.audiences.map((a) => <View key={a} style={styles.audience}><Text style={styles.audienceText}>{a}</Text></View>)}
                </View>
              ) : null}
            </>
          ) : null}

          {service?.requirements?.length ? (
            <>
              <Text style={styles.section}>Вимоги до приміщення</Text>
              {service.requirements.map((r, i) => <Text key={i} style={styles.requirement}>• {r}</Text>)}
            </>
          ) : null}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.clay} />
            <Text style={styles.infoText}>Передоплата 30% фіксує дату й програму, решта — на місці. Команда приїжджає за 20 хвилин до початку.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Орієнтовно</Text>
          <Text style={styles.footerPrice}>{price ? `${price} грн` : pack?.price ?? 'за запитом'}</Text>
        </View>
        <Pressable style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>Забронювати</Text>
          <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  missing: { fontSize: 16, color: COLORS.ink, fontWeight: '700' },
  backLink: { padding: 12 }, backLinkText: { color: COLORS.green, fontWeight: '800' },
  imageWrap: { height: 280, backgroundColor: COLORS.paper2 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 80 },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.card },
  body: { padding: 18 },
  kicker: { fontSize: 10, color: COLORS.clay, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.ink, marginTop: 6 },
  sub: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  audiences: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  audience: { backgroundColor: COLORS.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
  audienceText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  desc: { fontSize: 14, lineHeight: 21, color: COLORS.muted, marginTop: 16 },
  section: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginTop: 24, marginBottom: 10 },
  variant: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  variantActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  variantLabel: { fontSize: 14, fontWeight: '800', color: COLORS.ink },
  variantMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  variantPrice: { fontSize: 16, fontWeight: '800', color: COLORS.clay },
  activeText: { color: COLORS.white },
  listCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 16 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 10 },
  bulletText: { flex: 1, fontSize: 13, color: COLORS.ink, lineHeight: 18 },
  requirement: { fontSize: 12, color: COLORS.muted, lineHeight: 18 },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.paper2, borderRadius: RADIUS.md, padding: 14, marginTop: 22 },
  infoText: { flex: 1, fontSize: 11, color: COLORS.muted, lineHeight: 17 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: COLORS.line, paddingHorizontal: 18, paddingVertical: 12, paddingBottom: 18 },
  footerLabel: { fontSize: 10, color: COLORS.muted },
  footerPrice: { fontSize: 20, fontWeight: '800', color: COLORS.clay },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.clay, paddingVertical: 14, paddingHorizontal: 22, borderRadius: RADIUS.md, ...SHADOWS.stamp },
  bookBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
