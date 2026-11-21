import { Text } from '../src/components/AccessibleText';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionTitle } from '../src/components/common';
import { PRIVACY_URL } from '../src/constants/config';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { useAccessibility } from '../src/providers/AccessibilityProvider';
import { useAuth } from '../src/providers/AuthProvider';
import { usePrivacy } from '../src/providers/PrivacyProvider';
import { disablePush, enablePush } from '../src/services/push';

/**
 * Налаштування приватності й доступності (Етап 4, Фаза A).
 * Зміни негайно зберігаються в AsyncStorage; PWA отримує їх одразу,
 * APK — з першою збіркою після цієї фази (JS-код без нових модулів).
 */

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { consent, update } = usePrivacy();
  const { fontScale, contrast, setFontScale, toggleContrast } = useAccessibility();
  const auth = useAuth();

  const togglePush = async (value: boolean) => {
    await update({ push: value });
    if (auth.token) {
      if (value) await enablePush(auth.token);
      else await disablePush(auth.token);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Налаштування" eyebrow="Приватність і доступність" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Ionicons name="shield-checkmark-outline" size={26} color={COLORS.green} />
          <Text style={styles.introText}>
            Ви керуєте згодою в будь-який момент. Аналітика не надсилає жодної
            події, доки її не увімкнено.
          </Text>
        </View>

        <SectionTitle>Приватність</SectionTitle>
        <View style={styles.card}>
          <SettingRow
            icon="bar-chart-outline"
            label="Аналітика"
            hint="Знеособлені події воронки — без телефону, імені й адреси"
            value={consent.analytics}
            onChange={(value) => void update({ analytics: value })}
          />
          <Separator />
          <SettingRow
            icon="notifications-outline"
            label="Push-нагадування"
            hint={auth.token ? 'Сповіщення про статус і дату свята' : 'Увійдіть у кабінет, щоб увімкнути'}
            value={consent.push}
            onChange={(value) => void togglePush(value)}
          />
          <Separator />
          <SettingRow
            icon="location-outline"
            label="Геолокація"
            hint="Дозвіл запитується окремо, лише при розрахунку дороги"
            value={consent.location}
            onChange={(value) => void update({ location: value })}
          />
          <Separator />
          <Pressable style={styles.linkRow} onPress={() => void Linking.openURL(PRIVACY_URL)}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.green} />
            <Text style={styles.linkLabel}>Політика конфіденційності</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.muted} />
          </Pressable>
        </View>

        <SectionTitle>Доступність</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.label}>Розмір шрифту</Text>
          <View style={styles.segments}>
            {[
              { value: 1, label: '100%' },
              { value: 1.15, label: '115%' },
              { value: 1.3, label: '130%' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.segment,
                  fontScale === option.value && styles.segmentActive,
                ]}
                onPress={() => setFontScale(option.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    fontScale === option.value && styles.segmentTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Separator />
          <SettingRow
            icon="contrast-outline"
            label="Підвищений контраст"
            hint="Темніший текст замість сірого — легше читати"
            value={contrast}
            onChange={toggleContrast}
          />
        </View>

        <Text style={styles.note}>
          Dark mode не входить у цю фазу — ми свідомо не змінюємо всю палітру,
          щоб не зламати звичний вигляд додатка.
        </Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={COLORS.green} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.line, true: COLORS.green }}
        thumbColor={COLORS.white}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18 },
  introCard: { flexDirection: 'row', gap: 11, alignItems: 'center', backgroundColor: '#E7F2EC', borderRadius: RADIUS.md, padding: 14, marginTop: 16, marginBottom: 20 },
  introText: { flex: 1, fontSize: 12, color: COLORS.greenDeep, lineHeight: 17 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 6, marginBottom: 20, ...SHADOWS.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  rowHint: { fontSize: 10, color: COLORS.muted, lineHeight: 14, marginTop: 3 },
  sep: { height: 1, backgroundColor: COLORS.line, marginLeft: 43 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  linkLabel: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.green },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', paddingHorizontal: 12, paddingTop: 10, marginBottom: 8 },
  segments: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.paper },
  segmentActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  segmentText: { fontSize: 13, fontWeight: '800', color: COLORS.muted },
  segmentTextActive: { color: COLORS.white },
  note: { fontSize: 10, color: COLORS.muted, lineHeight: 15, textAlign: 'center', marginTop: 4 },
});
