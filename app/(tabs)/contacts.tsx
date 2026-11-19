import React, { useEffect, useState } from 'react';
import {
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchNews, fetchOffers, submitReview, type NewsItem, type Offer } from '../../src/api/client';
import { BrandHeader, SectionTitle } from '../../src/components/common';
import { useCatalog } from '../../src/providers/CatalogProvider';
import { EMAIL, HOURS, PHONE, TEL } from '../../src/constants/config';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';

/** Контакти беруться з секції site_content (як і на сайті) — див. CatalogProvider.
 *  Стара колекція /api/data/contacts лишається лише джерелом адреси,
 *  поки поле address не заповнене в /admin/content. */

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog, refresh, refreshing } = useCatalog();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  // Форма відгуку (POST /api/reviews → статус pending → модерація в адмінці сайту).
  const [rvRating, setRvRating] = useState(5);
  const [rvName, setRvName] = useState('');
  const [rvText, setRvText] = useState('');
  const [rvSending, setRvSending] = useState(false);
  const [rvDone, setRvDone] = useState(false);
  const [rvError, setRvError] = useState<string | null>(null);

  const c = catalog.contacts;
  const phone = c.phone || PHONE;
  const tel = c.tel || TEL;
  const email = c.email || EMAIL;
  const hours = c.hours || HOURS;
  const address = c.address || 'с-ще Теплик, Вінницька обл., 40+ км';

  const loadFeed = async () => {
    setLoadingFeed(true);
    const [o, n] = await Promise.allSettled([fetchOffers(), fetchNews()]);
    if (o.status === 'fulfilled') setOffers(o.value.slice(0, 3));
    if (n.status === 'fulfilled') setNews(n.value.slice(0, 3));
    setLoadingFeed(false);
  };

  useEffect(() => { void loadFeed(); }, []);

  const onRefresh = async () => {
    await Promise.all([refresh(), loadFeed()]);
  };

  const handleReview = async () => {
    if (!rvName.trim()) {
      setRvError('Вкажіть ваше ім’я');
      return;
    }
    if (rvText.trim().length < 10) {
      setRvError('Напишіть кілька слів про свято (щонайменше 10 символів)');
      return;
    }
    setRvError(null);
    setRvSending(true);
    const res = await submitReview({ name: rvName.trim(), text: rvText.trim(), rating: rvRating });
    setRvSending(false);
    if (res.ok) {
      setRvDone(true);
      setRvName('');
      setRvText('');
      setRvRating(5);
    } else {
      setRvError(res.error ?? 'Не вдалося надіслати відгук');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 110 }]}
      refreshControl={<RefreshControl refreshing={refreshing || loadingFeed} onRefresh={() => void onRefresh()} tintColor={COLORS.green} />}
      showsVerticalScrollIndicator={false}
    >
      <BrandHeader eyebrow="Зв'язатися з нами" title="Контакти ☎️" />

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Свято приїжджає до Вас</Text>
        <Text style={styles.heroText}>Ми не заклад з адресою — програму, реквізит і обладнання привозимо на вашу локацію.</Text>
        <Pressable style={styles.heroBtn} onPress={() => router.push('/(tabs)/booking')}>
          <Text style={styles.heroBtnText}>Забронювати дату</Text>
          <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <ContactRow icon="call-outline" label="Телефон" value={phone} onPress={() => void Linking.openURL(`tel:${tel}`)} action="Подзвонити" />
        <View style={styles.sep} />
        <ContactRow icon="mail-outline" label="Пошта" value={email} onPress={() => void Linking.openURL(`mailto:${email}`)} action="Написати" />
        <View style={styles.sep} />
        <ContactRow icon="time-outline" label="Години роботи" value={hours} />
        <View style={styles.sep} />
        <ContactRow icon="location-outline" label="Виїзд" value={address} multiline />
      </View>

      <SectionTitle>Соцмережі</SectionTitle>
      <View style={styles.socialRow}>
        {c.whatsapp ? <SocialButton label="WhatsApp" icon="logo-whatsapp" url={c.whatsapp} color={COLORS.green} /> : null}
        {c.telegram ? <SocialButton label="Telegram" icon="paper-plane-outline" url={c.telegram} color={COLORS.green} /> : null}
        {c.facebook ? <SocialButton label="Facebook" icon="logo-facebook" url={c.facebook} color={COLORS.green} /> : null}
        {c.instagram ? <SocialButton label="Instagram" icon="logo-instagram" url={c.instagram} color={COLORS.clay} /> : null}
        {c.tiktok ? <SocialButton label="TikTok" icon="logo-tiktok" url={c.tiktok} color={COLORS.ink} /> : null}
        {!c.phone && !c.email && !c.telegram ? (
          <Text style={styles.hint}>Контакти оновлюються з сайту…</Text>
        ) : null}
      </View>

      {offers.length ? (
        <>
          <SectionTitle>Акції</SectionTitle>
          {offers.map((o, i) => (
            <View key={o._id ?? i} style={styles.offerCard}>
              <Text style={styles.offerIcon}>{o.icon ?? '🎁'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerTitle}>{o.title}</Text>
                {o.description ? <Text style={styles.offerText}>{o.description}</Text> : null}
              </View>
            </View>
          ))}
        </>
      ) : null}

      {news.length ? (
        <>
          <SectionTitle>Новини</SectionTitle>
          {news.map((n, i) => {
            const id = n._id ?? String(i);
            const expanded = expandedNews === id;
            const expandable = Boolean(n.content && n.content.trim());
            return (
              <Pressable
                key={id}
                style={styles.newsCard}
                onPress={() => expandable && setExpandedNews(expanded ? null : id)}
              >
                <Text style={styles.newsTitle}>{n.title}</Text>
                {n.date ? <Text style={styles.newsDate}>{n.date}</Text> : null}
                {expandable ? (
                  <>
                    <Text style={styles.newsContent} numberOfLines={expanded ? undefined : 2}>
                      {n.content}
                    </Text>
                    <Text style={styles.newsMore}>{expanded ? 'Згорнути ↑' : 'Читати далі ↓'}</Text>
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </>
      ) : null}

      {/* ВІДГУК */}
      <SectionTitle>Залишити відгук</SectionTitle>
      {rvDone ? (
        <View style={styles.reviewDone}>
          <Ionicons name="checkmark-circle" size={34} color={COLORS.green} />
          <Text style={styles.reviewDoneTitle}>Дякуємо!</Text>
          <Text style={styles.reviewDoneText}>
            Відгук надіслано — він з'явиться на сайті після перевірки модератором.
          </Text>
          <Pressable style={styles.reviewAgain} onPress={() => setRvDone(false)}>
            <Text style={styles.reviewAgainText}>Написати ще один</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>Ваша оцінка</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRvRating(star)} hitSlop={6}>
                <Text style={[styles.star, star <= rvRating && styles.starActive]}>
                  {star <= rvRating ? '★' : '☆'}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Ваше ім’я"
            placeholderTextColor={COLORS.muted}
            value={rvName}
            onChangeText={setRvName}
          />
          <TextInput
            style={[styles.reviewInput, styles.reviewTextArea]}
            placeholder="Як пройшло свято? Що сподобалося?"
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            value={rvText}
            onChangeText={setRvText}
          />
          {rvError ? <Text style={styles.reviewError}>{rvError}</Text> : null}
          <Pressable
            style={[styles.reviewSubmit, rvSending && { opacity: 0.7 }]}
            onPress={() => void handleReview()}
            disabled={rvSending}
          >
            <Text style={styles.reviewSubmitText}>
              {rvSending ? 'Надсилаємо…' : 'Надіслати відгук'}
            </Text>
          </Pressable>
          <Text style={styles.reviewNote}>
            Відгук перевірить модератор команди — це захищає від спаму.
          </Text>
        </View>
      )}

      <Text style={styles.source}>Контакти з site_content · оновлюються через /admin/content</Text>
    </ScrollView>
  );
}

function ContactRow({
  icon, label, value, onPress, action, multiline,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
  action?: string;
  multiline?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowIcon}><Ionicons name={icon} size={20} color={COLORS.green} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={multiline ? undefined : 2}>{value}</Text>
      </View>
      {onPress ? (
        <View style={styles.rowAction}><Text style={styles.rowActionText}>{action ?? 'Відкрити'}</Text></View>
      ) : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

function SocialButton({ label, icon, url, color }: { label: string; icon: keyof typeof Ionicons.glyphMap; url: string; color: string }) {
  return (
    <Pressable style={[styles.socialBtn, { borderColor: color }]} onPress={() => void Linking.openURL(url)}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.socialText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18 },
  heroCard: { backgroundColor: COLORS.greenDeep, borderRadius: RADIUS.xl, padding: 20, marginBottom: 18, ...SHADOWS.stamp },
  heroTitle: { fontSize: 21, fontWeight: '800', color: COLORS.white },
  heroText: { fontSize: 12, color: COLORS.mutedLight, lineHeight: 18, marginTop: 8 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.clay, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 16 },
  heroBtnText: { color: COLORS.white, fontWeight: '800' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.line, padding: 4, ...SHADOWS.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase' },
  rowValue: { fontSize: 14, color: COLORS.ink, fontWeight: '700', marginTop: 2, lineHeight: 19 },
  rowAction: { backgroundColor: COLORS.paper2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill },
  rowActionText: { fontSize: 10, fontWeight: '800', color: COLORS.green },
  sep: { height: 1, backgroundColor: COLORS.line, marginLeft: 62 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: COLORS.white },
  socialText: { fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 12, color: COLORS.muted },
  source: { textAlign: 'center', fontSize: 10, color: COLORS.muted, marginTop: 18, lineHeight: 14 },
  offerCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  offerIcon: { fontSize: 24 },
  offerTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  offerText: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginTop: 3 },
  newsCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  newsTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  newsDate: { fontSize: 10, color: COLORS.clay, marginTop: 4 },
  newsContent: { fontSize: 12, lineHeight: 18, color: COLORS.muted, marginTop: 8 },
  newsMore: { fontSize: 11, fontWeight: '800', color: COLORS.green, marginTop: 8 },
  reviewCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 16, ...SHADOWS.card },
  reviewLabel: { fontSize: 12, fontWeight: '800', color: COLORS.ink, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  star: { fontSize: 30, color: COLORS.line },
  starActive: { color: COLORS.ochre },
  reviewInput: { backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: COLORS.ink, marginBottom: 10 },
  reviewTextArea: { height: 96, textAlignVertical: 'top' },
  reviewError: { fontSize: 12, color: COLORS.danger, marginBottom: 8 },
  reviewSubmit: { backgroundColor: COLORS.green, paddingVertical: 13, borderRadius: RADIUS.md, alignItems: 'center' },
  reviewSubmitText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  reviewNote: { fontSize: 10, color: COLORS.muted, textAlign: 'center', marginTop: 10, lineHeight: 14 },
  reviewDone: { alignItems: 'center', backgroundColor: '#E7F2EC', borderRadius: RADIUS.lg, padding: 22 },
  reviewDoneTitle: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginTop: 10 },
  reviewDoneText: { fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  reviewAgain: { marginTop: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.green, paddingVertical: 9, paddingHorizontal: 16, borderRadius: RADIUS.md },
  reviewAgainText: { color: COLORS.green, fontWeight: '800', fontSize: 12 },
});
