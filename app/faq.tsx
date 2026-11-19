import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatalog } from '../src/providers/CatalogProvider';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';

/** FAQ — секція `faq` сайту (редагується в /admin/content). */
export default function FaqScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Питання й відповіді" title="FAQ 💬" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {catalog.faq.length ? (
          catalog.faq.map((item, i) => {
            const expanded = open === i;
            return (
              <Pressable
                key={i}
                style={[styles.item, expanded && styles.itemOpen]}
                onPress={() => setOpen(expanded ? null : i)}
              >
                <View style={styles.qRow}>
                  <Text style={styles.q}>{item.q}</Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.clay}
                  />
                </View>
                {expanded ? <Text style={styles.a}>{item.a}</Text> : null}
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.empty}>Питання ще додаються — поки що телефонуйте, відповімо охоче.</Text>
        )}

        <View style={styles.help}>
          <Text style={styles.helpTitle}>Не знайшли відповідь?</Text>
          <Text style={styles.helpText}>Напишіть нам у чат або залиште заявку — відповімо протягом 20 хвилин щодня з 9:00 до 21:00.</Text>
          <Pressable style={styles.helpBtn} onPress={() => router.push('/(tabs)/contacts')}>
            <Text style={styles.helpBtnText}>Написати нам</Text>
            <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
  item: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOWS.card },
  itemOpen: { borderColor: COLORS.green },
  qRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  q: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.ink, lineHeight: 20 },
  a: { fontSize: 13, lineHeight: 20, color: COLORS.muted, marginTop: 10 },
  empty: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  help: { backgroundColor: COLORS.ochre, borderRadius: RADIUS.xl, padding: 18, marginTop: 18, ...SHADOWS.stamp },
  helpTitle: { fontSize: 17, fontWeight: '800', color: COLORS.greenDeep },
  helpText: { fontSize: 12, lineHeight: 18, color: COLORS.greenDeep, marginTop: 6 },
  helpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.greenDeep, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 14 },
  helpBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
