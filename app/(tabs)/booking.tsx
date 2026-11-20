import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../../src/providers/CatalogProvider';
import { fetchBusyDates, submitOrder } from '../../src/api/client';
import { BrandHeader } from '../../src/components/common';
import { DatePicker } from '../../src/components/DatePicker';
import { useBookingStore } from '../../src/store/bookingStore';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { formatMoney } from '../../src/utils/format';

const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,}$/;

/** Швидкий вибір часу початку (свята часто стартують о цій годині). */
const TIME_CHIPS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog } = useCatalog();
  const {
    selection, form, calcItems, transport, hydrated,
    setVariant, updateForm, resetBooking, clearCalc, clearDraft,
  } = useBookingStore();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Публічні зайняті дати — лише попередження, не блокування. */
  const [busyDates, setBusyDates] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    void fetchBusyDates().then((dates) => {
      if (mounted) setBusyDates(dates);
    });
    return () => { mounted = false; };
  }, []);

  const formats = useMemo(() => {
    const opts = [...catalog.serviceOptions];
    if (selection?.format && !opts.includes(selection.format)) opts.unshift(selection.format);
    return opts;
  }, [catalog.serviceOptions, selection]);

  const priceLabel = selection?.price
    ? `${selection.price} грн${selection.variantLabel ? ` · ${selection.variantLabel}` : ''}`
    : selection?.priceLabel ?? null;

  const calcTotal = useMemo(() => {
    // Позиції кошторису приходять уже з цінами (`«1500 грн»`).
    return calcItems.reduce((sum, item) => {
      const value = Number(String(item.price ?? '').replace(/[^\d]/g, ''));
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      return sum + (Number.isFinite(value) ? value * qty : 0);
    }, 0);
  }, [calcItems]);

  const hasDraftHint =
    hydrated && !selection && !calcItems.length && Boolean(form.name || form.phone || form.date);

  const validate = () => {
    if (!form.name.trim()) return 'Вкажіть ваше ім’я';
    if (!PHONE_PATTERN.test(form.phone.trim())) return 'Введіть коректний номер телефону';
    if (!form.date.trim()) return 'Вкажіть дату свята';
    return null;
  };

  const handleSubmit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSending(true);

    // Позиції: вибрана послуга/пакет + позиції кошторису (калькулятор/підбір).
    const items = [
      ...(selection?.kind === 'service'
        ? [{
            serviceId: selection.id,
            serviceName: selection.name,
            quantity: 1,
            price: selection.price ? `${selection.price} грн` : undefined,
          }]
        : []),
      ...calcItems,
      ...(transport ? [transport] : []),
    ];

    const result = await submitOrder({
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      date: form.date.trim(),
      time: form.time.trim() || undefined,
      eventType: form.eventType || selection?.format || 'Інше',
      eventAddress: form.address.trim() || undefined,
      childrenCount: form.childrenCount ? Number(form.childrenCount) : undefined,
      notes: form.notes.trim() || undefined,
      ...(selection?.kind === 'service' ? { serviceName: selection.name } : {}),
      ...(selection?.kind === 'package'
        ? { packageId: selection.id, packageName: selection.name }
        : {}),
      ...(items.length ? { items } : {}),
    });
    setSending(false);
    if (result.ok) {
      clearDraft(); // заявку надіслано — чернетка більше не потрібна
      setSuccess(true);
    } else {
      setError(result.error ?? 'Не вдалося надіслати заявку');
    }
  };

  if (success) {
    return (
      <View style={[styles.successScreen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={72} color={COLORS.green} /></View>
        <Text style={styles.successTitle}>Заявку надіслано! 🎉</Text>
        <Text style={styles.successText}>
          Команда «Жирафик» отримала вашу заявку і зв’яжеться з вами протягом 20 хвилин, щоб узгодити дату, програму та адресу.
        </Text>
        <Pressable
          style={styles.successBtn}
          onPress={() => {
            resetBooking();
            setSuccess(false);
          }}
        >
          <Text style={styles.successBtnText}>Створити ще одну заявку</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <BrandHeader eyebrow="Крок за кроком" title="Бронювання 📅" />

        {hasDraftHint ? (
          <View style={styles.draftHint}>
            <Ionicons name="save-outline" size={14} color={COLORS.green} />
            <Text style={styles.draftHintText}>Чернетку збережено — можете закрити застосунок і повернутися пізніше.</Text>
          </View>
        ) : null}

        {selection ? (
          <View style={styles.selectionCard}>
            <View style={styles.selectionHead}>
              <Ionicons name={selection.kind === 'package' ? 'gift-outline' : 'sparkles-outline'} size={20} color={COLORS.clay} />
              <Text style={styles.selectionKind}>{selection.kind === 'package' ? 'Обраний пакет' : 'Обрана послуга'}</Text>
              <Pressable onPress={resetBooking}><Ionicons name="close-circle-outline" size={20} color={COLORS.muted} /></Pressable>
            </View>
            <Text style={styles.selectionName}>{selection.name}</Text>
            {selection.subtitle ? <Text style={styles.selectionSub}>{selection.subtitle}</Text> : null}

            {selection.kind === 'service' && selection.variants?.length ? (
              <View style={styles.variants}>
                {selection.variants.map((v) => {
                  const active = v.id === selection.variantId || (!selection.variantId && v === selection.variants?.[0]);
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => setVariant(v.id, v.label, v.price)}
                      style={[styles.variant, active && styles.variantActive]}
                    >
                      <Text style={[styles.variantText, active && styles.variantTextActive]}>{v.label}</Text>
                      <Text style={[styles.variantPrice, active && styles.variantTextActive]}>{v.price} грн</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {priceLabel ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabelText}>Орієнтовна вартість</Text>
                <Text style={styles.priceValue}>{priceLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.clay} />
            <Text style={styles.hintText}>Оберіть послугу або пакет у каталозі — ми додамо його до заявки. Або просто заповніть форму нижче.</Text>
          </View>
        )}

        {/* ПОЗИЦІЇ КОШТОРИСУ (калькулятор / підбір) */}
        {calcItems.length || transport ? (
          <View style={styles.calcCard}>
            <View style={styles.calcHead}>
              <Ionicons name="calculator-outline" size={18} color={COLORS.green} />
              <Text style={styles.calcTitle}>Зібрано в кошторисі</Text>
              <Pressable onPress={clearCalc} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={20} color={COLORS.muted} />
              </Pressable>
            </View>
            {calcItems.map((item, i) => (
              <View key={`${item.serviceId}-${i}`} style={styles.calcRow}>
                <Text style={styles.calcName} numberOfLines={2}>
                  {item.serviceName}
                  {item.quantity && item.quantity > 1 ? ` × ${item.quantity} шт` : ''}
                </Text>
                <Text style={styles.calcPrice}>{item.price ?? 'уточнюється'}</Text>
              </View>
            ))}
            {transport ? (
              <View style={styles.calcRow}>
                <Text style={styles.calcName}>{transport.serviceName}</Text>
                <Text style={styles.calcPrice}>{transport.price ?? 'уточнюється'}</Text>
              </View>
            ) : null}
            <View style={styles.calcTotal}>
              <Text style={styles.calcTotalLabel}>Орієнтовно разом</Text>
              <Text style={styles.calcTotalValue}>{calcTotal ? `${formatMoney(calcTotal)} грн` : 'уточнюється'}</Text>
            </View>
            <Pressable style={styles.calcEdit} onPress={() => router.push('/calculator')}>
              <Text style={styles.calcEditText}>Змінити розрахунок</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Ваші дані</Text>
        <Field label="Ваше ім'я *">
          <TextInput style={styles.input} placeholder="Олена" placeholderTextColor={COLORS.muted} value={form.name} onChangeText={(v) => updateForm({ name: v })} />
        </Field>
        <Field label="Телефон *">
          <TextInput
            style={styles.input}
            placeholder="+380__ ___ __ __"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => updateForm({ phone: v })}
          />
        </Field>

        <Text style={styles.section}>Деталі свята</Text>
        <View style={styles.twoCols}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="Дата свята *">
              <DatePicker
                value={form.date}
                onChange={(iso) => updateForm({ date: iso })}
                busyDates={busyDates}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Час початку">
              <TextInput style={styles.input} placeholder="14:00" placeholderTextColor={COLORS.muted} value={form.time} onChangeText={(v) => updateForm({ time: v })} />
            </Field>
          </View>
        </View>

        <Field label="Швидкий вибір часу">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formatChips}>
            {TIME_CHIPS.map((t) => (
              <Pressable
                key={t}
                onPress={() => updateForm({ time: form.time === t ? '' : t })}
                style={[styles.formatChip, form.time === t && styles.formatChipActive]}
              >
                <Text style={[styles.formatChipText, form.time === t && styles.formatChipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Field>

        <Field label="Формат">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formatChips}>
            {formats.map((f) => (
              <Pressable
                key={f}
                onPress={() => updateForm({ eventType: f })}
                style={[styles.formatChip, form.eventType === f && styles.formatChipActive]}
              >
                <Text style={[styles.formatChipText, form.eventType === f && styles.formatChipTextActive]}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Field>

        <Field label="Адреса та місце проведення">
          <TextInput
            style={styles.input}
            placeholder="вул., будинок; квартира / клас / майданчик"
            placeholderTextColor={COLORS.muted}
            value={form.address}
            onChangeText={(v) => updateForm({ address: v })}
          />
        </Field>

        <Field label="Кількість дітей">
          <TextInput
            style={styles.input}
            placeholder="Наприклад, 8"
            placeholderTextColor={COLORS.muted}
            keyboardType="number-pad"
            value={form.childrenCount}
            onChangeText={(v) => updateForm({ childrenCount: v.replace(/[^\d]/g, '') })}
          />
        </Field>

        <Field label="Коментарі: скільки дітей, який вік">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="6 дітей, 6–8 років, бажано космонавти"
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            value={form.notes}
            onChangeText={(v) => updateForm({ notes: v })}
          />
        </Field>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable style={[styles.submit, sending && styles.submitDisabled]} onPress={() => void handleSubmit()} disabled={sending}>
          {sending ? <ActivityIndicator color={COLORS.white} /> : (
            <>
              <Text style={styles.submitText}>Забронювати дату</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </>
          )}
        </Pressable>
        <Text style={styles.disclaimer}>Надсилаючи форму, ви погоджуєтесь, що команда зв’яжеться з вами для узгодження дати й програми. Передоплата 30%, решта на місці.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18 },
  section: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginTop: 18, marginBottom: 10 },
  selectionCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 16, marginBottom: 14, ...SHADOWS.stamp },
  selectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectionKind: { flex: 1, fontSize: 11, color: COLORS.clay, fontWeight: '800', textTransform: 'uppercase' },
  selectionName: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginTop: 8 },
  selectionSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  variant: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.paper },
  variantActive: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  variantText: { fontSize: 12, color: COLORS.ink, fontWeight: '700' },
  variantPrice: { fontSize: 11, color: COLORS.clay },
  variantTextActive: { color: COLORS.white },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 14, paddingTop: 12 },
  priceLabelText: { fontSize: 12, color: COLORS.muted },
  priceValue: { fontSize: 18, fontWeight: '800', color: COLORS.clay },
  hint: { flexDirection: 'row', gap: 8, backgroundColor: COLORS.paper2, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  hintText: { flex: 1, fontSize: 11, color: COLORS.muted, lineHeight: 16 },
  draftHint: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#E7F2EC', borderRadius: RADIUS.md, padding: 10, marginBottom: 10 },
  draftHintText: { flex: 1, fontSize: 11, color: COLORS.green, lineHeight: 16 },
  calcCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.green, borderRadius: RADIUS.lg, padding: 14, marginBottom: 14, ...SHADOWS.stamp },
  calcHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  calcTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.ink },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5 },
  calcName: { flex: 1, fontSize: 12, color: COLORS.ink, lineHeight: 17 },
  calcPrice: { fontSize: 12, fontWeight: '800', color: COLORS.clay },
  calcTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 8, paddingTop: 8 },
  calcTotalLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '700' },
  calcTotalValue: { fontSize: 15, fontWeight: '800', color: COLORS.clay },
  calcEdit: { alignSelf: 'flex-start', marginTop: 8 },
  calcEditText: { fontSize: 12, fontWeight: '800', color: COLORS.green },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.ink, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: COLORS.ink },
  textArea: { height: 90, textAlignVertical: 'top' },
  twoCols: { flexDirection: 'row' },
  formatChips: { gap: 8, paddingBottom: 4 },
  formatChip: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.white },
  formatChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  formatChipText: { fontSize: 11, color: COLORS.muted, fontWeight: '700' },
  formatChipTextActive: { color: COLORS.white },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FBEAE7', borderRadius: RADIUS.md, padding: 12, marginTop: 6 },
  errorText: { flex: 1, fontSize: 12, color: COLORS.danger },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.clay, paddingVertical: 15, borderRadius: RADIUS.md, marginTop: 16, ...SHADOWS.stamp },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  disclaimer: { fontSize: 10, color: COLORS.muted, textAlign: 'center', lineHeight: 15, marginTop: 12 },
  successScreen: { flex: 1, backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  successIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.ink, textAlign: 'center' },
  successText: { fontSize: 13, color: COLORS.muted, lineHeight: 19, textAlign: 'center', marginTop: 12 },
  successBtn: { backgroundColor: COLORS.green, paddingVertical: 14, paddingHorizontal: 24, borderRadius: RADIUS.md, marginTop: 28 },
  successBtnText: { color: COLORS.white, fontWeight: '800' },
});
