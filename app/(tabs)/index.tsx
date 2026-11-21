import { Text } from '../../src/components/AccessibleText';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../../src/providers/CatalogProvider';
import { BrandHeader, PressCard, RemoteImage, SectionTitle, Stars } from '../../src/components/common';
import { GalleryImage } from '../../src/components/GalleryImage';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { TEL } from '../../src/constants/config';
import type { PartyPackage, Service } from '../../src/types/catalog';

/** Швидкі дії Етапу 2 — усе, що рахує й підбирає, на один тап. */
const QUICK_ACTIONS: Array<{ route: '/calculator' | '/assistant' | '/gallery' | '/faq'; icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }> = [
  { route: '/calculator', icon: 'calculator-outline', title: 'Кошторис', sub: 'Збери сам' },
  { route: '/assistant', icon: 'flash-outline', title: 'Підбір', sub: 'За 30 секунд' },
  { route: '/gallery', icon: 'images-outline', title: 'Галерея', sub: 'Фото й відео' },
  { route: '/faq', icon: 'chatbubble-ellipses-outline', title: 'FAQ', sub: 'Питання' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog, refreshing } = useCatalog();
  const { hero, trust, services, packages, timeline, promises, reviews } = catalog;

  const openService = (item: Service) =>
    router.push({ pathname: '/details', params: { kind: 'service', id: item.id } });
  const openPackage = (item: PartyPackage) =>
    router.push({ pathname: '/details', params: { kind: 'package', id: item.id } });

  const popular = services.filter((s) => s.showOnHome !== false).slice(0, 8);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <BrandHeader
        eyebrow="Мобільний магістр свята"
        title="ЖИРАФИК"
        right={
          <Pressable style={styles.phoneBtn} onPress={() => void Linking.openURL(`tel:${TEL}`)}>
            <Ionicons name="call-outline" size={18} color={COLORS.green} />
          </Pressable>
        }
      />

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroStripe} />
        <Text style={styles.heroTitle}>
          {hero?.titleLead}{'\n'}
          <Text style={styles.heroAccent}>{hero?.titleAccent}</Text> {hero?.titleTail}
        </Text>
        <Text style={styles.heroLead}>{hero?.lead}</Text>
        <Pressable style={styles.heroCta} onPress={() => router.push('/(tabs)/booking')}>
          <Text style={styles.heroCtaText}>{hero?.cta ?? 'Забронювати дату'}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </Pressable>
        <View style={styles.heroMicro}>
          {hero?.micro?.map((m, i) => (
            <Text key={i} style={styles.microLine}>
              {m.before} <Text style={styles.microBold}>{m.bold}</Text>{m.after}
            </Text>
          ))}
        </View>
        {refreshing ? <Text style={styles.sync}>Оновлюємо дані з сайту…</Text> : null}
      </View>

      {/* SEASONAL */}
      {catalog.seasonal ? (
        <Pressable
          style={styles.seasonal}
          onPress={() => {
            const link = catalog.seasonal?.ctaLink ?? '';
            if (link.startsWith('/book')) router.push('/(tabs)/booking');
            else if (link.startsWith('/packages')) router.push('/(tabs)/packages');
            else if (link.startsWith('/calculator')) router.push('/calculator');
            else router.push('/(tabs)/services');
          }}
        >
          {catalog.seasonal.image ? (
            <View style={styles.seasonalImage}>
              <GalleryImage path={catalog.seasonal.image} width={600} style={StyleSheet.absoluteFillObject} />
            </View>
          ) : null}
          <View style={styles.seasonalBody}>
            <Text style={styles.seasonalTitle}>{catalog.seasonal.title}</Text>
            <Text style={styles.seasonalText} numberOfLines={3}>{catalog.seasonal.text}</Text>
            <Text style={styles.seasonalCta}>{catalog.seasonal.ctaLabel ?? 'Дивитися'} →</Text>
          </View>
        </Pressable>
      ) : null}

      {/* TRUST */}
      <View style={styles.trustGrid}>
        {trust.map((t) => (
          <View key={t.label} style={styles.trustItem}>
            <Text style={styles.trustValue}>{t.value}</Text>
            <Text style={styles.trustLabel}>{t.label}</Text>
          </View>
        ))}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable key={action.route} style={styles.quickCard} onPress={() => router.push(action.route)}>
            <View style={styles.quickIcon}>
              <Ionicons name={action.icon} size={20} color={COLORS.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickTitle}>{action.title}</Text>
              <Text style={styles.quickSub}>{action.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>

      {/* POPULAR SERVICES */}
      <SectionTitle
        action={
          <Pressable onPress={() => router.push('/(tabs)/services')}>
            <Text style={styles.link}>Усі →</Text>
          </Pressable>
        }
      >
        Популярні послуги
      </SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
        {popular.map((item) => {
          const variant = item.variants?.[0];
          return (
            <PressCard key={item.id} onPress={() => openService(item)} style={styles.serviceCard}>
              <View style={styles.serviceImageWrap}>
                <RemoteImage idOrPath={item.images?.[0]} style={StyleSheet.absoluteFillObject} />
                {item.audiences?.[0] ? <View style={styles.ageBadge}><Text style={styles.ageText}>{item.audiences[0]}</Text></View> : null}
              </View>
              <View style={styles.serviceBody}>
                <Text style={styles.serviceTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.serviceDesc} numberOfLines={2}>{item.desc}</Text>
                <Text style={styles.price}>
                  {variant ? `від ${variant.price} грн` : item.price ?? 'ціна за запитом'}
                </Text>
              </View>
            </PressCard>
          );
        })}
      </ScrollView>

      {/* PACKAGES */}
      <SectionTitle
        action={
          <Pressable onPress={() => router.push('/(tabs)/packages')}>
            <Text style={styles.link}>Усі →</Text>
          </Pressable>
        }
      >
        Разом вигідніше
      </SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
        {packages.slice(0, 5).map((item) => (
          <PressCard key={item.id} onPress={() => openPackage(item)} style={styles.packageCard}>
            {item.hit ? <View style={styles.hit}><Text style={styles.hitText}>ХІТ ЗАМОВЛЕНЬ</Text></View> : null}
            <Text style={styles.packageName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.packagePeriod}>{item.period}</Text>
            <Text style={styles.packagePrice}>{item.price}</Text>
            <View style={styles.divider} />
            {item.items.slice(0, 4).map((it, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText} numberOfLines={1}>{it.text}</Text>
              </View>
            ))}
            <Text style={styles.packageMore}>Детальніше →</Text>
          </PressCard>
        ))}
      </ScrollView>

      {/* TIMELINE */}
      <SectionTitle>Сценарій дня</SectionTitle>
      <View style={styles.timeline}>
        {timeline.map((step, i) => (
          <View key={i} style={[styles.timelineRow, step.on && styles.timelineRowOn]}>
            <View style={styles.timelineNum}><Text style={styles.timelineNumText}>{i + 1}</Text></View>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTime}>{step.time}</Text>
              <Text style={styles.timelineTitle}>{step.title}</Text>
              <Text style={styles.timelineText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* PROMISES */}
      <SectionTitle>Чому це безпечно</SectionTitle>
      {promises.map((p, i) => (
        <View key={i} style={styles.promiseCard}>
          <Text style={styles.promiseIco}>{p.ico}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.promiseTitle}>{p.title}</Text>
            <Text style={styles.promiseText}>{p.text}</Text>
          </View>
        </View>
      ))}

      {/* GALLERY */}
      {catalog.gallery.length ? (
        <>
          <SectionTitle
            action={
              <Pressable onPress={() => router.push('/gallery')}>
                <Text style={styles.link}>Усі →</Text>
              </Pressable>
            }
          >
            Галерея
          </SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {catalog.gallery.filter((a) => a.featured).slice(0, 6).map((album) => (
              <Pressable key={album.id} style={styles.galleryItem} onPress={() => router.push('/gallery')}>
                <GalleryImage path={album.images[0]} width={500} style={StyleSheet.absoluteFillObject} />
                <View style={styles.galleryLabel}>
                  <Text style={styles.galleryLabelText} numberOfLines={1}>{album.title}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* REVIEWS */}
      <SectionTitle>Відгуки замовників</SectionTitle>
      {reviews.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <Stars count={r.rating} />
          <Text style={styles.reviewQuote}>{r.quote}</Text>
          <Text style={styles.reviewName}>{r.name}</Text>
          <Text style={styles.reviewContext}>{r.context}</Text>
        </View>
      ))}

      {/* CTA */}
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Готові влаштувати свято?</Text>
        <Text style={styles.ctaText}>Відповідаємо протягом 20 хв щодня з 9:00 до 21:00.</Text>
        <Pressable style={styles.ctaBtn} onPress={() => router.push('/(tabs)/booking')}>
          <Text style={styles.ctaBtnText}>Забронювати дату</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </Pressable>
      </View>

      <Text style={styles.source}>
        {catalog.source === 'api' ? 'Дані синхронізовано з сайтом' : 'Офлайн-копія контенту сайту'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18, paddingBottom: 110 },
  phoneBtn: {
    width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    backgroundColor: COLORS.greenDeep, borderRadius: RADIUS.xl, padding: 22,
    paddingTop: 26, marginBottom: 20, ...SHADOWS.stamp,
  },
  heroStripe: { position: 'absolute', top: 0, left: 22, right: 22, height: 5, backgroundColor: COLORS.ochre, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  heroTitle: { fontSize: 30, lineHeight: 34, fontWeight: '800', color: COLORS.white, marginBottom: 12 },
  heroAccent: { color: COLORS.ochre },
  heroLead: { fontSize: 13, lineHeight: 19, color: COLORS.mutedLight, marginBottom: 18 },
  heroCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.clay, paddingVertical: 13, borderRadius: RADIUS.md },
  heroCtaText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  heroMicro: { marginTop: 18, gap: 5 },
  microLine: { fontSize: 11, color: COLORS.mutedLight },
  microBold: { color: COLORS.ochre, fontWeight: '800' },
  sync: { marginTop: 10, fontSize: 10, color: COLORS.ochre },
  seasonal: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line,
    borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 18, ...SHADOWS.card,
  },
  seasonalImage: { width: 110, backgroundColor: COLORS.paper2 },
  seasonalBody: { flex: 1, padding: 14 },
  seasonalTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
  seasonalText: { fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 6 },
  seasonalCta: { fontSize: 12, fontWeight: '800', color: COLORS.clay, marginTop: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  quickCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line,
    borderRadius: RADIUS.md, padding: 12,
  },
  quickIcon: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  quickSub: { fontSize: 10, color: COLORS.muted, marginTop: 1 },
  trustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  trustItem: { width: '48%', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 12 },
  trustValue: { fontSize: 20, fontWeight: '800', color: COLORS.clay },
  trustLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  link: { color: COLORS.clay, fontWeight: '700', fontSize: 13 },
  hRow: { gap: 12, paddingRight: 18, paddingBottom: 6 },
  serviceCard: { width: 210 },
  serviceImageWrap: { height: 120, backgroundColor: COLORS.paper2, position: 'relative' },
  ageBadge: { position: 'absolute', left: 8, top: 8, backgroundColor: COLORS.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill },
  ageText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  serviceBody: { padding: 12 },
  serviceTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
  serviceDesc: { fontSize: 11, color: COLORS.muted, lineHeight: 15, marginTop: 6, minHeight: 30 },
  price: { fontSize: 14, fontWeight: '800', color: COLORS.clay, marginTop: 8 },
  packageCard: { width: 250, padding: 16 },
  hit: { backgroundColor: COLORS.clay, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, marginBottom: 8 },
  hitText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  packageName: { fontSize: 17, fontWeight: '800', color: COLORS.ink },
  packagePeriod: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  packagePrice: { fontSize: 22, fontWeight: '800', color: COLORS.clay, marginTop: 8 },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 10 },
  bulletRow: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  bullet: { color: COLORS.ochre, fontWeight: '800' },
  bulletText: { flex: 1, fontSize: 11, color: COLORS.muted },
  packageMore: { color: COLORS.green, fontWeight: '800', fontSize: 12, marginTop: 8 },
  timeline: { marginBottom: 24 },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  timelineRowOn: { backgroundColor: COLORS.paper2, borderRadius: RADIUS.md, padding: 10, marginHorizontal: -10 },
  timelineNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  timelineNumText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  timelineBody: { flex: 1 },
  timelineTime: { fontSize: 10, color: COLORS.clay, fontWeight: '800', textTransform: 'uppercase' },
  timelineTitle: { fontSize: 14, fontWeight: '800', color: COLORS.ink, marginTop: 1 },
  timelineText: { fontSize: 11, color: COLORS.muted, lineHeight: 15, marginTop: 2 },
  promiseCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  promiseIco: { fontSize: 24 },
  promiseTitle: { fontSize: 14, fontWeight: '800', color: COLORS.ink },
  promiseText: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginTop: 3 },
  galleryItem: { width: 150, height: 110, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.paper2, justifyContent: 'flex-end' },
  galleryLabel: { backgroundColor: 'rgba(18,59,40,0.82)', paddingHorizontal: 8, paddingVertical: 5 },
  galleryLabelText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  reviewCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOWS.card },
  reviewQuote: { fontSize: 13, lineHeight: 19, color: COLORS.ink, marginTop: 8 },
  reviewName: { fontSize: 13, fontWeight: '800', color: COLORS.green, marginTop: 10 },
  reviewContext: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  ctaCard: { backgroundColor: COLORS.ochre, borderRadius: RADIUS.xl, padding: 20, marginTop: 16, ...SHADOWS.stamp },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: COLORS.greenDeep },
  ctaText: { fontSize: 12, color: COLORS.greenDeep, marginTop: 6, lineHeight: 17 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.greenDeep, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 14 },
  ctaBtnText: { color: COLORS.white, fontWeight: '800' },
  source: { textAlign: 'center', fontSize: 10, color: COLORS.muted, marginTop: 18 },
});
