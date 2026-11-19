import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatalog } from '../src/providers/CatalogProvider';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { formatDuration, formatMoney, isItemVariant } from '../src/utils/format';
import { TEL } from '../src/constants/config';
import type { PartyPackage, Service } from '../src/types/catalog';

/**
 * Підбір програми за 30 секунд — дзеркало сайтового ServiceAssistant:
 * вік → кількість гостей → тривалість → послуги, що вміщуються у час,
 * і пакети, що підходять під вік. Ліміт групи (дітей на аніматора)
 * і списки вікових груп редагуються в адмінці сайту (секція «Підбір»).
 */
interface FitResult {
  service: Service;
  variant: { label: string; pricingUnit?: 'time' | 'item'; durationMin: number; price: number } | null;
  reasons: string[];
  skipped: boolean;
}

function fitVariant(service: Service, duration: number | null): Omit<FitResult, 'service' | 'reasons'> {
  const variants = service.variants ?? [];
  const items = variants.filter(isItemVariant);
  const timed = variants.filter((v) => !isItemVariant(v) && v.durationMin > 0);

  // Послуги виключно «за шт» (Блиск тату) — завжди показуємо.
  if (timed.length === 0 && items.length > 0) {
    const cheapest = items.reduce((a, b) => (b.price < a.price ? b : a));
    return { variant: cheapest, skipped: false };
  }
  // Решта без тривалості — доповнення до замовлення.
  if (timed.length === 0) {
    const cheapest = variants.length ? variants.reduce((a, b) => (b.price < a.price ? b : a)) : null;
    return { variant: cheapest, skipped: false };
  }
  if (duration === null) {
    const cheapest = timed.reduce((a, b) => (b.price < a.price ? b : a));
    return { variant: cheapest, skipped: false };
  }
  const fit = timed.filter((v) => v.durationMin <= duration);
  if (fit.length === 0) return { variant: null, skipped: true };
  // Найкращий вклад: найдовший варіант, що вміщується.
  const best = fit.reduce((a, b) => (b.durationMin > a.durationMin ? b : a));
  return { variant: best, skipped: false };
}

export default function AssistantScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const { services, packages, assistant, contacts } = catalog;

  const [age, setAge] = useState<string | null>(null);
  const [guestsRaw, setGuestsRaw] = useState('');
  const [duration, setDuration] = useState<number | null>(null);

  const guests = Number.parseInt(guestsRaw, 10);
  const guestsNum = Number.isFinite(guests) && guests > 0 ? guests : null;
  const ageGroup = assistant.ageGroups.find((g) => g.id === age) ?? null;
  const ageFilterActive = Boolean(ageGroup && ageGroup.refs.length > 0);
  const asked = age !== null || guestsNum !== null || duration !== null;
  const kidsPerAnimator = assistant.kidsPerAnimator;

  const { serviceResults, packageResults, skipped } = useMemo(() => {
    const refs = ageFilterActive ? new Set(ageGroup!.refs) : null;
    const serviceIds = refs
      ? new Set([...refs].filter((r) => r.startsWith('service:')).map((r) => r.slice('service:'.length)))
      : null;
    const packageIds = refs
      ? new Set([...refs].filter((r) => r.startsWith('package:')).map((r) => r.slice('package:'.length)))
      : null;

    const allowedServices = serviceIds ? services.filter((s) => serviceIds.has(s.id)) : services;
    const allowedPackages = packageIds ? packages.filter((p) => packageIds.has(p.id)) : packages;

    const out: FitResult[] = [];
    let durSkipped = 0;
    for (const service of allowedServices) {
      const { variant, skipped: isSkipped } = fitVariant(service, duration);
      if (isSkipped || !variant) {
        if (isSkipped) durSkipped += 1;
        continue;
      }
      const reasons: string[] = [];
      const item = isItemVariant(variant);
      if (item) {
        reasons.push(`Ціна за шт: ${formatMoney(variant.price)} / ${variant.label}`);
      } else if (duration !== null) {
        reasons.push(`Вміщується у ваш час: ${formatDuration(variant.durationMin)} — ${formatMoney(variant.price)} грн`);
      } else {
        reasons.push(`Тривалість ${formatDuration(variant.durationMin)} — ${formatMoney(variant.price)} грн`);
      }
      if (ageFilterActive) reasons.push(`Рекомендуємо для віку «${ageGroup?.label}»`);
      out.push({ service, variant, reasons, skipped: false });
    }

    return {
      serviceResults: out,
      packageResults: allowedPackages,
      skipped: {
        byAge: services.length - allowedServices.length + packages.length - allowedPackages.length,
        byDuration: durSkipped,
      },
    };
  }, [services, packages, duration, ageGroup, ageFilterActive]);

  const overCapacity = guestsNum !== null && guestsNum > kidsPerAnimator;
  const animators = guestsNum !== null ? Math.ceil(guestsNum / kidsPerAnimator) : null;

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Вік · гості · час" title="Підбір програми ⚡" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. ВІК */}
        <Text style={styles.q}>1. Вік дітей</Text>
        <View style={styles.opts}>
          {assistant.ageGroups.map((group) => {
            const active = age === group.id;
            return (
              <Pressable
                key={group.id}
                style={[styles.opt, active && styles.optActive]}
                onPress={() => setAge(active ? null : group.id)}
              >
                <Text style={[styles.optText, active && styles.optTextActive]}>{group.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 2. ГОСТІ */}
        <Text style={styles.q}>2. Кількість гостей</Text>
        <TextInput
          style={styles.input}
          value={guestsRaw}
          onChangeText={(v) => setGuestsRaw(v.replace(/[^\d]/g, ''))}
          keyboardType="number-pad"
          placeholder="Дітей на святі, напр. 8"
          placeholderTextColor={COLORS.muted}
        />
        <Text style={styles.hint}>
          Комфортно працює до {kidsPerAnimator} дітей на аніматора — для більшої групи додаємо другого.
        </Text>

        {/* 3. ТРИВАЛІСТЬ */}
        <Text style={styles.q}>3. Тривалість</Text>
        <View style={styles.opts}>
          {assistant.durations.map((item) => {
            const active = duration === item.min;
            return (
              <Pressable
                key={item.min}
                style={[styles.opt, active && styles.optActive]}
                onPress={() => setDuration(active ? null : item.min)}
              >
                <Text style={[styles.optText, active && styles.optTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>Покажемо лише послуги, що вміщуються у вибраний час.</Text>

        {/* СТАНУТТЯ */}
        {ageGroup?.askManager ? (
          <View style={styles.notice}>
            <Ionicons name="person-outline" size={18} color={COLORS.clay} />
            <Text style={styles.noticeText}>
              Для вікової групи «{ageGroup.label}» програму узгоджуємо індивідуально — зателефонуйте, підберемо формат і тривалість під вашу дитину.
            </Text>
          </View>
        ) : null}

        {overCapacity ? (
          <View style={styles.notice}>
            <Ionicons name="people-outline" size={18} color={COLORS.clay} />
            <Text style={styles.noticeText}>
              Група понад {kidsPerAnimator} дітей. Для {guestsNum} гостей можемо додати {animators! > 1 ? `${animators} аніматори` : 'другого аніматора'} — вартість уточнюється при замовленні.
            </Text>
          </View>
        ) : null}

        {/* РЕЗУЛЬТАТИ */}
        <Text style={styles.resultsHead}>
          {asked
            ? `Знайдено: послуг — ${serviceResults.length}, пакетів — ${packageResults.length}`
            : 'Оберіть вік, кількість гостей і тривалість — покажемо підходящі послуги й пакети.'}
        </Text>
        {skipped.byDuration > 0 ? (
          <Text style={styles.skipped}>Ще {skipped.byDuration} послуг не вмістилися у вибраний час.</Text>
        ) : null}

        {asked && serviceResults.length === 0 && packageResults.length === 0 ? (
          <View style={styles.notice}>
            <Ionicons name="search-outline" size={18} color={COLORS.clay} />
            <Text style={styles.noticeText}>Під ці параметри нічого не знайшлося. Напишіть менеджеру — запропонуємо, що можливо саме у вашому випадку.</Text>
          </View>
        ) : null}

        {serviceResults.length ? (
          <>
            <Text style={styles.group}>Послуги</Text>
            {serviceResults.map(({ service, variant, reasons }) => (
              <Pressable
                key={service.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/details', params: { kind: 'service', id: service.id } })}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardEmoji}>{service.emoji || '🎈'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{service.title}</Text>
                    <Text style={styles.cardCat}>{service.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={3}>{service.desc}</Text>
                {reasons.map((r) => (
                  <View key={r} style={styles.reasonRow}>
                    <Text style={styles.reasonDot}>•</Text>
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))}
                <View style={styles.cardFoot}>
                  <Text style={styles.cardPrice}>
                    {variant ? `${formatMoney(variant.price)} грн` : 'ціна уточнюється'}
                    {variant ? (isItemVariant(variant) ? ' / шт' : ` / ${variant.label}`) : ''}
                  </Text>
                  <Text style={styles.cardAction}>Детальніше →</Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}

        {packageResults.length ? (
          <>
            <Text style={styles.group}>Готові пакети</Text>
            {packageResults.map((pkg: PartyPackage) => (
              <Pressable
                key={pkg.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/details', params: { kind: 'package', id: pkg.id } })}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardEmoji}>🎁</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{pkg.name}</Text>
                    <Text style={styles.cardCat}>{pkg.format || 'Комплекс'}</Text>
                  </View>
                </View>
                <View style={styles.pkgItems}>
                  {pkg.items.slice(0, 5).map((it, i) => (
                    <Text key={i} style={styles.pkgItem}>• {it.text}</Text>
                  ))}
                </View>
                <View style={styles.cardFoot}>
                  <Text style={styles.cardPrice}>
                    {pkg.bundlePrice ? `${formatMoney(pkg.bundlePrice)} грн` : pkg.price}
                    {pkg.period ? ` — ${pkg.period.replace(/^\//, '')}` : ''}
                  </Text>
                  <Text style={styles.cardAction}>Детальніше →</Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}

        {/* МЕНЕДЖЕР */}
        <View style={styles.manager}>
          <Text style={styles.managerTitle}>Не знайшли підходяче або вагаєтесь щодо віку?</Text>
          <Text style={styles.managerText}>
            Менеджер підбере формат під ваш вік, кількість гостей і тривалість — і назве остаточну ціну. Відповідаємо {contacts.hours}.
          </Text>
          <View style={styles.managerBtns}>
            <Pressable style={styles.callBtn} onPress={() => void Linking.openURL(`tel:${TEL}`)}>
              <Ionicons name="call-outline" size={16} color={COLORS.white} />
              <Text style={styles.callBtnText}>Зателефонувати</Text>
            </Pressable>
            <Pressable style={styles.bookBtn} onPress={() => router.push('/(tabs)/booking')}>
              <Text style={styles.bookBtnText}>Залишити заявку</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
  q: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 18, marginBottom: 10 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opt: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: COLORS.white },
  optActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  optText: { fontSize: 12, fontWeight: '700', color: COLORS.ink },
  optTextActive: { color: COLORS.white },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: COLORS.ink },
  hint: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginTop: 6 },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: '#FDF3E7', borderWidth: 1, borderColor: '#F0DFC8', borderRadius: RADIUS.md, padding: 14, marginTop: 16 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17, color: COLORS.ink },
  resultsHead: { fontSize: 13, fontWeight: '700', color: COLORS.ink, marginTop: 22 },
  skipped: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  group: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOWS.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
  cardCat: { fontSize: 10, color: COLORS.clay, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  cardDesc: { fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 8 },
  reasonRow: { flexDirection: 'row', gap: 6, marginTop: 5 },
  reasonDot: { color: COLORS.ochre, fontWeight: '800', fontSize: 12 },
  reasonText: { flex: 1, fontSize: 11, lineHeight: 16, color: COLORS.ink },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 12, paddingTop: 10 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.clay },
  cardAction: { fontSize: 12, fontWeight: '800', color: COLORS.green },
  pkgItems: { marginTop: 8, gap: 3 },
  pkgItem: { fontSize: 11, lineHeight: 16, color: COLORS.muted },
  manager: { backgroundColor: COLORS.greenDeep, borderRadius: RADIUS.xl, padding: 18, marginTop: 24, ...SHADOWS.stamp },
  managerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  managerText: { fontSize: 12, lineHeight: 18, color: COLORS.mutedLight, marginTop: 8 },
  managerBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.clay, paddingVertical: 11, paddingHorizontal: 16, borderRadius: RADIUS.md },
  callBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  bookBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 11, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.mutedLight },
  bookBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
});
