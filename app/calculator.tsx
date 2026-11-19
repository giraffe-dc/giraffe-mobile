import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatalog } from '../src/providers/CatalogProvider';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useBookingStore } from '../src/store/bookingStore';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { formatMoney, isItemVariant } from '../src/utils/format';
import { shareText } from '../src/utils/share';

/**
 * Калькулятор «Збери сам» — дзеркало сайтового /calculator:
 * послуги × варіанти (+ кількість для «за шт»), готові пакети з
 * економією, транспорт за відстанню (тариф із адмінки сайту).
 * Підсумок можна надіслати в заявку або поділитися.
 */
export default function CalculatorScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const { setCalcItems } = useBookingStore();

  // serviceId -> variantId (як на сайті)
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [kmInput, setKmInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const { services, packages, calcNote, roadTariff, roadFreeKm, roadNote } = catalog;

  const itemQty = (serviceId: string) => Math.max(1, qtys[serviceId] ?? 1);
  const changeQty = (serviceId: string, delta: number) =>
    setQtys((prev) => ({ ...prev, [serviceId]: Math.max(1, (prev[serviceId] ?? 1) + delta) }));

  const toggle = (serviceId: string, variantId: string) =>
    setPicked((prev) => {
      const next = { ...prev };
      if (next[serviceId] === variantId) delete next[serviceId];
      else next[serviceId] = variantId;
      return next;
    });

  const pickedEntries = useMemo(() => Object.entries(picked), [picked]);

  const total = pickedEntries.reduce((sum, [sid, vid]) => {
    const service = services.find((s) => s.id === sid);
    const variant = service?.variants?.find((v) => v.id === vid);
    const unit = variant?.price ?? service?.calcValue ?? 0;
    const qty = variant && isItemVariant(variant) ? itemQty(sid) : 1;
    return sum + unit * qty;
  }, 0);

  // Транспорт: (км − безкоштовна зона) × тариф, не нижче нуля.
  const km = Number(kmInput.replace(',', '.'));
  const hasKm = kmInput.trim() !== '' && Number.isFinite(km) && km > 0;
  const transportCost = hasKm ? Math.max(0, km - roadFreeKm) * roadTariff : null;
  const grandTotal = transportCost === null ? total : total + transportCost;

  const summaryLines = () => {
    const lines: string[] = ['Кошторис «Жирафик» (орієнтовно):'];
    for (const [sid, vid] of pickedEntries) {
      const service = services.find((s) => s.id === sid);
      if (!service) continue;
      const variant = service?.variants?.find((v) => v.id === vid);
      const unit = variant?.price ?? service.calcValue ?? 0;
      const qty = variant && isItemVariant(variant) ? itemQty(sid) : 1;
      const name = `${service.title}${variant ? ` (${variant.label})` : ''}`;
      lines.push(`• ${name} — ${formatMoney(unit * qty)} грн${qty > 1 ? ` × ${qty} шт` : ''}`);
    }
    if (transportCost !== null) lines.push(`• 🚗 Транспорт (в один бік, ${km} км) — ${formatMoney(transportCost)} грн`);
    lines.push(`Разом: ${formatMoney(grandTotal)} грн`);
    lines.push(calcNote);
    return lines;
  };

  const handleShare = async () => {
    const result = await shareText(summaryLines().join('\n'));
    setNotice(result === 'copied' ? 'Розрахунок скопійовано — вставте в чат 📋' : result === 'failed' ? 'Не вдалося поділитися' : null);
    if (result === 'shared') setNotice(null);
  };

  const handleToBooking = () => {
    const items = pickedEntries.flatMap(([sid, vid]) => {
      const service = services.find((s) => s.id === sid);
      if (!service) return [];
      const variant = service.variants?.find((v) => v.id === vid);
      const qty = variant && isItemVariant(variant) ? itemQty(sid) : 1;
      return [{
        serviceId: service.id,
        serviceName: `${service.title}${variant ? ` (${variant.label})` : ''}`,
        price: variant ? `${variant.price} грн` : service.price,
        ...(qty > 1 ? { quantity: qty } : {}),
      }];
    });
    const transportItem = transportCost !== null
      ? { serviceId: 'transport', serviceName: `🚗 Транспорт (в один бік, ${km} км)`, price: `${transportCost} грн` }
      : undefined;
    setCalcItems(items, transportItem);
    router.push('/(tabs)/booking');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Орієнтовний розрахунок" title="Кошторис свята 🧮" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lede}>
          Позначте послуги й отримайте орієнтовну суму. Точну ціну, дату й адресу узгодить команда після заявки.
        </Text>

        {/* ПОСЛУГИ */}
        <Text style={styles.section}>Послуги</Text>
        {services.map((service) => {
          const variants = service.variants.length
            ? service.variants
            : [{ id: `${service.id}-default`, label: service.unit ?? '', durationMin: 0, price: service.calcValue ?? 0 }];
          return (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHead}>
                <Text style={styles.serviceEmoji}>{service.emoji || '🎁'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceFormat}>{service.format}</Text>
                </View>
              </View>
              {service.desc ? <Text style={styles.serviceDesc}>{service.desc}</Text> : null}

              <View style={styles.variants}>
                {variants.map((variant) => {
                  const selected = picked[service.id] === variant.id;
                  const item = isItemVariant(variant);
                  const qty = itemQty(service.id);
                  return (
                    <Pressable
                      key={variant.id}
                      style={[styles.variant, selected && styles.variantActive]}
                      onPress={() => toggle(service.id, variant.id)}
                    >
                      <View style={styles.variantMain}>
                        <Ionicons
                          name={selected ? 'checkbox' : 'square-outline'}
                          size={16}
                          color={selected ? COLORS.white : COLORS.muted}
                        />
                        <Text style={[styles.variantLabel, selected && styles.variantActiveText]}>
                          {variant.label || service.calcLabel || service.title}
                          {item ? ' / шт' : ''}
                        </Text>
                      </View>
                      <Text style={[styles.variantPrice, selected && styles.variantActiveText]}>
                        {formatMoney(variant.price)} грн
                      </Text>
                      {selected && item ? (
                        <View style={styles.qty}>
                          <Pressable style={styles.qtyBtn} onPress={() => changeQty(service.id, -1)} hitSlop={6}>
                            <Text style={styles.qtyBtnText}>−</Text>
                          </Pressable>
                          <Text style={styles.qtyValue}>{qty} шт</Text>
                          <Pressable style={styles.qtyBtn} onPress={() => changeQty(service.id, 1)} hitSlop={6}>
                            <Text style={styles.qtyBtnText}>+</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* ПАКЕТИ */}
        {packages.length ? (
          <>
            <Text style={styles.section}>Готові комплекси</Text>
            <Text style={styles.sectionNote}>Комплекси дешевші за суму окремих послуг. Оберіть комплекс — або зберіть власний вище.</Text>
            {packages.map((pkg) => {
              const quote = pkg.items.reduce((sum, item) => {
                const service = services.find((s) => s.variants?.some((v) => v.id === item.variantId));
                const variant = service?.variants?.find((v) => v.id === item.variantId);
                return sum + (variant?.price ?? 0) * (item.qty ?? 1);
              }, 0);
              const economy = quote > 0 && pkg.bundlePrice ? quote - pkg.bundlePrice : 0;
              return (
                <Pressable
                  key={pkg.id}
                  style={styles.pkgCard}
                  onPress={() => router.push({ pathname: '/details', params: { kind: 'package', id: pkg.id } })}
                >
                  <View style={styles.pkgHead}>
                    <Text style={styles.pkgName}>{pkg.name}</Text>
                    {pkg.hit ? <View style={styles.hit}><Text style={styles.hitText}>ХІТ</Text></View> : null}
                  </View>
                  <Text style={styles.pkgPrice}>
                    {pkg.price} <Text style={styles.pkgPeriod}>{pkg.period}</Text>
                    {economy > 0 ? <Text style={styles.pkgEconomy}> · економія {formatMoney(economy)} грн</Text> : null}
                  </Text>
                  <Text style={styles.pkgItems} numberOfLines={2}>{pkg.items.map((i) => i.text).join(', ')}</Text>
                  <Text style={styles.pkgMore}>Детальніше →</Text>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {/* ТРАНСПОРТ */}
        <View style={styles.transport}>
          <Text style={styles.transportTitle}>🚗 Транспорт</Text>
          <Text style={styles.transportLabel}>Відстань в один бік, км</Text>
          <TextInput
            style={styles.kmInput}
            value={kmInput}
            onChangeText={setKmInput}
            keyboardType="decimal-pad"
            placeholder="напр. 12"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.transportCost}>
            {transportCost !== null
              ? `Транспорт: ${formatMoney(transportCost)} грн — ${km} км × ${roadTariff} грн/км${roadFreeKm > 0 ? ` (перші ${roadFreeKm} км безкоштовно)` : ''}`
              : 'Вартість дороги: уточнюється. Вкажіть відстань — або залиште поле порожнім, і менеджер розрахує за адресою.'}
          </Text>
          <Text style={styles.transportNote}>{roadNote}</Text>
        </View>

        {notice ? (
          <View style={styles.notice}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.green} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ПІДСУМОК */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>{transportCost !== null ? 'Орієнтовна сума разом' : 'Орієнтовна сума'}</Text>
            <Text style={styles.totalValue}>{formatMoney(grandTotal)} грн</Text>
          </View>
          <Pressable style={styles.shareBtn} onPress={() => void handleShare()}>
            <Ionicons name="share-outline" size={20} color={COLORS.green} />
          </Pressable>
        </View>
        <View style={styles.breakdown}>
          <Text style={styles.breakdownText}>Послуги: {formatMoney(total)} грн</Text>
          <Text style={styles.breakdownText}>
            Транспорт: {transportCost !== null ? `${formatMoney(transportCost)} грн` : 'уточнюється'}
          </Text>
        </View>
        <Pressable style={styles.cta} onPress={handleToBooking}>
          <Text style={styles.ctaText}>Додати до заявки</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18, paddingTop: 16 },
  lede: { fontSize: 13, lineHeight: 19, color: COLORS.muted, marginBottom: 8 },
  section: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginTop: 22, marginBottom: 8 },
  sectionNote: { fontSize: 12, lineHeight: 17, color: COLORS.muted, marginBottom: 10 },
  serviceCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOWS.card },
  serviceHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceEmoji: { fontSize: 22 },
  serviceTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
  serviceFormat: { fontSize: 10, color: COLORS.clay, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  serviceDesc: { fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 8 },
  variants: { gap: 8, marginTop: 12 },
  variant: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.paper, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  variantActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  variantMain: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 },
  variantLabel: { fontSize: 13, fontWeight: '700', color: COLORS.ink, flexShrink: 1 },
  variantPrice: { fontSize: 13, fontWeight: '800', color: COLORS.clay },
  variantActiveText: { color: COLORS.white },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.green },
  qtyValue: { fontSize: 12, fontWeight: '800', color: COLORS.white },
  pkgCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOWS.card },
  pkgHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pkgName: { fontSize: 15, fontWeight: '800', color: COLORS.ink, flex: 1 },
  hit: { backgroundColor: COLORS.clay, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill },
  hitText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  pkgPrice: { fontSize: 18, fontWeight: '800', color: COLORS.clay, marginTop: 6 },
  pkgPeriod: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  pkgEconomy: { fontSize: 12, color: COLORS.green, fontWeight: '800' },
  pkgItems: { fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 6 },
  pkgMore: { fontSize: 12, fontWeight: '800', color: COLORS.green, marginTop: 8 },
  transport: { marginTop: 24, padding: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.line, borderRadius: RADIUS.lg, backgroundColor: COLORS.white },
  transportTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginBottom: 10 },
  transportLabel: { fontSize: 12, fontWeight: '700', color: COLORS.ink, marginBottom: 6 },
  kmInput: { backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.ink, marginBottom: 10 },
  transportCost: { fontSize: 13, fontWeight: '700', color: COLORS.ink, lineHeight: 18 },
  transportNote: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginTop: 6 },
  notice: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#E7F2EC', borderRadius: RADIUS.md, padding: 12, marginTop: 14 },
  noticeText: { flex: 1, fontSize: 12, color: COLORS.green },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.line,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20, ...SHADOWS.stamp,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { fontSize: 24, fontWeight: '800', color: COLORS.clay, marginTop: 2 },
  shareBtn: { width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center' },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  breakdownText: { fontSize: 11, color: COLORS.muted },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.green, paddingVertical: 13, borderRadius: RADIUS.md, marginTop: 10 },
  ctaText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
