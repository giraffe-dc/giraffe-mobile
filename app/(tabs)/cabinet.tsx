import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyOrders } from '../../src/api/client';
import { Pill, BrandHeader, SectionTitle } from '../../src/components/common';
import { useAuth } from '../../src/providers/AuthProvider';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { displayPhone, normalizePhone } from '../../src/utils/format';
import { statusLabel, statusTone, type MyOrder } from '../../src/types/orders';

/**
 * Кабінет клієнта (Етап 3 roadmap).
 *
 * Гість: телефон → OTP-код у Telegram (або deep link при першому вході).
 * Авторизований: власні заявки зі статусами, оновлення списку, вихід.
 *
 * Важливо: бронювання НІКОЛИ не блокується через зайняті дати — у кабінеті
 * лише статуси й історія, жодних обмежень на нові заявки.
 */

const MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

/** ISO → «20 листопада 2026» без залежності від Intl у Hermes. */
function humanDate(value?: string): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  const m = Number(month);
  if (!year || !day || !Number.isFinite(m) || m < 1 || m > 12) return value;
  return `${day} ${MONTHS[m - 1]} ${year}`;
}

function humanDateTime(value?: string): string {
  if (!value) return '';
  const date = humanDate(value);
  const time = value.length >= 16 ? value.slice(11, 16) : '';
  return time ? `${date}, ${time}` : date;
}

export default function CabinetScreen() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refreshOrders = useCallback(async (token: string) => {
    setLoadingOrders(true);
    setOrdersError(null);
    const list = await fetchMyOrders(token);
    setLoadingOrders(false);
    if (list === null) {
      setOrdersError('Не вдалося завантажити заявки. Перевірте з\'єднання.');
      return;
    }
    setOrders(list);
  }, []);

  // Завантажуємо історію щойно з'явився токен (після входу чи відновлення).
  useEffect(() => {
    if (!auth.token) {
      setOrders([]);
      return;
    }
    void refreshOrders(auth.token);
  }, [auth.token, refreshOrders]);

  // Повернувся з Telegram після deep link — самі перевіряємо підтвердження.
  useEffect(() => {
    if (!auth.pendingPhone || auth.delivery !== 'link') return;
    const onState = (state: string) => {
      if (state === 'active') void auth.confirm();
    };
    const sub = AppState.addEventListener('change', onState);
    return () => sub.remove();
  }, [auth.pendingPhone, auth.delivery, auth.confirm]);

  const onRequestCode = async () => {
    setLocalError(null);
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      setLocalError('Введіть український номер мобільного: +380 …');
      return;
    }
    setPhoneInput(normalized);
    const ok = await auth.startLogin(normalized);
    if (ok) setCode('');
  };

  const onSubmitCode = async () => {
    setLocalError(null);
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      setLocalError('Код складається з 6 цифр');
      return;
    }
    await auth.confirm(digits);
  };

  const onOpenLink = async () => {
    if (auth.link) {
      try {
        await Linking.openURL(auth.link);
      } catch {
        setLocalError('Не вдалося відкрити Telegram. Скопіюйте посилання вручну.');
      }
    }
  };

  // ── Стан завантаження сховища ──────────────────────────────────────
  if (!auth.hydrated) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  const contentInsets = {
    paddingTop: insets.top + 16,
    paddingBottom: insets.bottom + 110,
  };

  // ── Гість: форма входу ─────────────────────────────────────────────
  if (!auth.token) {
    const awaitingLink = auth.pendingPhone && auth.delivery === 'link';
    const awaitingCode = auth.pendingPhone && auth.delivery === 'telegram';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentInsets]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader eyebrow="Особистий простір" title="Кабінет 🦒" />

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Ваші свята — в одному місці</Text>
          <Text style={styles.introText}>
            Увійдіть за номером телефону, щоб бачити історію заявок і їхні статуси.
            Код надсилає бот «Жирафик» у Telegram — без платних SMS.
          </Text>
        </View>

        {!auth.pendingPhone ? (
          <View style={styles.card}>
            <SectionTitle>Вхід за телефоном</SectionTitle>
            <Text style={styles.label}>Номер мобільного</Text>
            <TextInput
              style={styles.input}
              placeholder="+380 (096) 123-45-67"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
              autoComplete="tel"
              value={phoneInput}
              onChangeText={setPhoneInput}
              onSubmitEditing={() => void onRequestCode()}
            />
            {localError ? <Text style={styles.error}>{localError}</Text> : null}
            <Pressable
              style={[styles.primaryBtn, auth.loading && { opacity: 0.7 }]}
              onPress={() => void onRequestCode()}
              disabled={auth.loading}
            >
              {auth.loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Отримати код</Text>
                  <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
                </>
              )}
            </Pressable>
            <Text style={styles.note}>
              Продовжуючи, ви підтверджуєте, що цей номер належить вам.
              Перший вхід прив'язує його до вашого Telegram.
            </Text>
          </View>
        ) : null}

        {awaitingLink ? (
          <View style={styles.card}>
            <SectionTitle>Підтвердьте в Telegram</SectionTitle>
            <Text style={styles.stepText}>
              Ми підготували код для номеру <Text style={styles.bold}>{auth.mask ?? displayPhone(auth.pendingPhone ?? '')}</Text>.
              Відкрийте бота і натисніть «Start» — ми прив'яжемо номер і завершимо вхід.
            </Text>
            <Pressable style={styles.telegramBtn} onPress={() => void onOpenLink()}>
              <Ionicons name="paper-plane" size={18} color={COLORS.white} />
              <Text style={styles.primaryBtnText}>Відкрити Telegram-бот</Text>
            </Pressable>
            {auth.link ? (
              <Text style={styles.linkHint} selectable>{auth.link}</Text>
            ) : null}
            {auth.error ? <Text style={styles.error}>{auth.error}</Text> : null}
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void auth.confirm()}
              disabled={auth.loading}
            >
              <Text style={styles.secondaryBtnText}>
                {auth.loading ? 'Перевіряємо…' : 'Я підтвердив(ла) — увійти'}
              </Text>
            </Pressable>
            <Pressable style={styles.textBtn} onPress={auth.cancelLogin}>
              <Text style={styles.textBtnLabel}>Ввести інший номер</Text>
            </Pressable>
          </View>
        ) : null}

        {awaitingCode ? (
          <View style={styles.card}>
            <SectionTitle>Код із Telegram</SectionTitle>
            <Text style={styles.stepText}>
              Надіслали 6 цифр у приватний чат бота для номера{' '}
              <Text style={styles.bold}>{auth.mask ?? displayPhone(auth.pendingPhone ?? '')}</Text>.
              Введіть їх нижче — код діє 10 хвилин.
            </Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="••••••"
              placeholderTextColor={COLORS.muted}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              onSubmitEditing={() => void onSubmitCode()}
            />
            {localError || auth.error ? (
              <Text style={styles.error}>{localError ?? auth.error}</Text>
            ) : null}
            <Pressable
              style={[styles.primaryBtn, auth.loading && { opacity: 0.7 }]}
              onPress={() => void onSubmitCode()}
              disabled={auth.loading}
            >
              {auth.loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Увійти</Text>
              )}
            </Pressable>
            {typeof auth.error === 'string' && /expired|застаріл/i.test(auth.error) ? (
              <Pressable style={styles.textBtn} onPress={auth.cancelLogin}>
                <Text style={styles.textBtnLabel}>Запросити новий код</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.textBtn} onPress={auth.cancelLogin}>
              <Text style={styles.textBtnLabel}>Ввести інший номер</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.source}>
          Вхід без пароля: код приходить у Telegram. Перше прив'язування номера
          можливе лише з приватного чату з ботом.
        </Text>
      </ScrollView>
    );
  }

  // ── Авторизований: історія заявок ──────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, contentInsets]}
      refreshControl={
        <RefreshControl
          refreshing={loadingOrders}
          onRefresh={() => void refreshOrders(auth.token as string)}
          tintColor={COLORS.green}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <BrandHeader
        eyebrow="Особистий простір"
        title="Мій кабінет"
        right={
          <Pressable onPress={auth.logout} hitSlop={8} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.clay} />
          </Pressable>
        }
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={26} color={COLORS.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileTitle}>Ви у кабінеті</Text>
          <Text style={styles.profilePhone}>{displayPhone(auth.phone ?? '')}</Text>
        </View>
        <Pill label="Клієнт" tone="green" />
      </View>

      <SectionTitle
        action={
          <Pressable onPress={() => void refreshOrders(auth.token as string)} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={COLORS.green} />
          </Pressable>
        }
      >
        Мої заявки {orders.length ? `(${orders.length})` : ''}
      </SectionTitle>

      {ordersError ? <Text style={styles.error}>{ordersError}</Text> : null}

      {!loadingOrders && orders.length === 0 && !ordersError ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={38} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>Заявок поки немає</Text>
          <Text style={styles.emptyText}>
            Коли ви залишите заявку на свято, вона з'явиться тут разом зі статусом.
          </Text>
        </View>
      ) : null}

      {orders.map((order) => {
        const id = String(order._id ?? '');
        const open = expanded === id;
        return (
          <Pressable
            key={id}
            style={styles.orderCard}
            onPress={() => setExpanded(open ? null : id)}
          >
            <View style={styles.orderHead}>
              <Text style={styles.orderNumber}>#{id.slice(-6).toUpperCase()}</Text>
              <Pill label={statusLabel(order.status)} tone={statusTone(order.status)} />
            </View>
            <Text style={styles.orderTitle}>
              {order.serviceName || order.packageName || order.eventType || 'Заявка на виїзд'}
            </Text>
            {order.date ? (
              <View style={styles.orderRow}>
                <Ionicons name="calendar-outline" size={15} color={COLORS.green} />
                <Text style={styles.orderRowText}>{humanDate(order.date)}</Text>
              </View>
            ) : null}
            {order.time ? (
              <View style={styles.orderRow}>
                <Ionicons name="time-outline" size={15} color={COLORS.green} />
                <Text style={styles.orderRowText}>{order.time}</Text>
              </View>
            ) : null}
            {order.eventAddress ? (
              <View style={styles.orderRow}>
                <Ionicons name="location-outline" size={15} color={COLORS.green} />
                <Text style={styles.orderRowText} numberOfLines={2}>{order.eventAddress}</Text>
              </View>
            ) : null}
            <Text style={styles.orderCreated}>
              подано {humanDateTime(order.createdAt)}
            </Text>

            {open ? (
              <View style={styles.orderDetails}>
                {order.eventType ? <DetailRow label="Привід" value={order.eventType} /> : null}
                {order.childrenCount ? (
                  <DetailRow label="Дітей" value={String(order.childrenCount)} />
                ) : null}
                {order.items?.length ? (
                  <>
                    <Text style={styles.detailsTitle}>Що замовили</Text>
                    {order.items.map((item, i) => (
                      <DetailRow
                        key={`${item.serviceName}-${i}`}
                        label={item.serviceName}
                        value={`${item.quantity ?? 1} ${item.price ?? ''}`.trim()}
                      />
                    ))}
                  </>
                ) : null}
                {order.notes ? <DetailRow label="Коментар" value={order.notes} /> : null}
              </View>
            ) : null}

            <View style={styles.orderFooter}>
              <Text style={styles.expandHint}>{open ? 'Згорнути ↑' : 'Детальніше ↓'}</Text>
            </View>
          </Pressable>
        );
      })}

      <Text style={styles.source}>
        Статуси оновлюються командою «Жирафик». Зайняті дати не блокують нові заявки —
        ми завжди уточнимо деталі телефоном.
      </Text>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18 },
  introCard: { backgroundColor: COLORS.greenDeep, borderRadius: RADIUS.xl, padding: 20, marginBottom: 18, ...SHADOWS.stamp },
  introTitle: { fontSize: 21, fontWeight: '800', color: COLORS.white },
  introText: { fontSize: 12, color: COLORS.mutedLight, lineHeight: 18, marginTop: 8 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 18, marginBottom: 18, ...SHADOWS.card },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', marginBottom: 7 },
  input: { backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 13, paddingVertical: 13, fontSize: 16, color: COLORS.ink, marginBottom: 12 },
  codeInput: { letterSpacing: 8, textAlign: 'center', fontSize: 22, fontWeight: '800' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: RADIUS.md },
  primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  telegramBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#229ED9', paddingVertical: 13, borderRadius: RADIUS.md, marginTop: 4 },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.green, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { color: COLORS.green, fontWeight: '800', fontSize: 13 },
  textBtn: { alignItems: 'center', paddingVertical: 12 },
  textBtnLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  note: { fontSize: 10, color: COLORS.muted, lineHeight: 15, marginTop: 12, textAlign: 'center' },
  stepText: { fontSize: 13, color: COLORS.ink, lineHeight: 20, marginBottom: 14 },
  bold: { fontWeight: '800' },
  linkHint: { fontSize: 10, color: COLORS.muted, marginTop: 8, lineHeight: 14 },
  error: { fontSize: 12, color: COLORS.danger, lineHeight: 17, marginBottom: 10 },
  source: { textAlign: 'center', fontSize: 10, color: COLORS.muted, marginTop: 18, lineHeight: 14 },
  logoutBtn: { padding: 8, backgroundColor: COLORS.paper2, borderRadius: RADIUS.pill },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 14, marginBottom: 20, ...SHADOWS.card },
  avatar: { width: 44, height: 44, borderRadius: RADIUS.pill, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  profileTitle: { fontSize: 10, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase' },
  profilePhone: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 3 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 26, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 10 },
  emptyText: { fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  orderCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 15, marginBottom: 10, ...SHADOWS.card },
  orderHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  orderNumber: { fontSize: 11, fontWeight: '800', color: COLORS.clay, letterSpacing: 1 },
  orderTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginBottom: 10 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  orderRowText: { flex: 1, fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  orderCreated: { fontSize: 10, color: COLORS.muted, marginTop: 6 },
  orderDetails: { borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 12, paddingTop: 12 },
  detailsTitle: { fontSize: 11, fontWeight: '800', color: COLORS.ink, marginTop: 10, marginBottom: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  detailLabel: { flex: 1, fontSize: 11, color: COLORS.muted },
  detailValue: { flex: 2, fontSize: 11, color: COLORS.ink, fontWeight: '700', textAlign: 'right' },
  orderFooter: { alignItems: 'center', marginTop: 10 },
  expandHint: { fontSize: 11, fontWeight: '800', color: COLORS.green },
});
