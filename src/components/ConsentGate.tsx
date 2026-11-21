import { Text } from './AccessibleText';
import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIVACY_URL } from '../constants/config';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { usePrivacy } from '../providers/PrivacyProvider';

/**
 * Екран згоди при першому запуску (Етап 4, Фаза A). Показується модально,
 * доки користувач не збереже вибір. Аналітика за замовчуванням ВИМКНЕНА.
 */
export function ConsentGate() {
  const { consent, hydrated, answered, update } = usePrivacy();
  const [saving, setSaving] = React.useState(false);

  if (!hydrated || answered) return null;

  const save = async () => {
    setSaving(true);
    await update({
      analytics: consent.analytics,
      push: consent.push,
      location: consent.location,
    });
    setSaving(false);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={34} color={COLORS.green} />
          </View>
          <Text style={styles.title}>Ваша приватність</Text>
          <Text style={styles.intro}>
            Перед початком роботи обрати, які дані ми можемо використовувати.
            Аналітика вимкнена за замовчуванням — ви можете увімкнути її пізніше
            у налаштуваннях.
          </Text>

          <Row
            icon="bar-chart-outline"
            label="Аналітика"
            hint="Знеособлені події: перегляд каталогу, розрахунок, заявка. Без телефону й імені."
            value={consent.analytics}
            onChange={(value) => void update({ analytics: value })}
          />
          <Row
            icon="notifications-outline"
            label="Push-нагадування"
            hint="Сповіщення про статус заявки й дату свята (якщо доступні на пристрої)."
            value={consent.push}
            onChange={(value) => void update({ push: value })}
          />
          <Row
            icon="location-outline"
            label="Геолокація"
            hint="Тільки для оцінки відстані до Теплика й вартості дороги. Запит дозволу — окремо."
            value={consent.location}
            onChange={(value) => void update({ location: value })}
          />

          <Pressable
            style={styles.linkBtn}
            onPress={() => void Linking.openURL(PRIVACY_URL)}
          >
            <Text style={styles.linkText}>Політика конфіденційності →</Text>
          </Pressable>

          <Pressable
            style={[styles.primary, saving && { opacity: 0.7 }]}
            onPress={() => void save()}
            disabled={saving}
          >
            <Text style={styles.primaryText}>Продовжити</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Row({
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

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(18,59,40,0.55)', justifyContent: 'center', padding: 18 },
  sheet: { backgroundColor: COLORS.paper, borderRadius: RADIUS.xl, padding: 20, ...SHADOWS.stamp },
  iconWrap: { alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.ink, textAlign: 'center' },
  intro: { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginTop: 10, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 12, marginBottom: 9 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  rowHint: { fontSize: 10, color: COLORS.muted, lineHeight: 14, marginTop: 3 },
  linkBtn: { alignItems: 'center', paddingVertical: 13 },
  linkText: { fontSize: 12, color: COLORS.green, fontWeight: '800', textDecorationLine: 'underline' },
  primary: { backgroundColor: COLORS.green, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
