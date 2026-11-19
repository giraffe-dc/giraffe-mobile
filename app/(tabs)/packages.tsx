import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../../src/providers/CatalogProvider';
import { BrandHeader, PressCard } from '../../src/components/common';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import type { PartyPackage } from '../../src/types/catalog';

export default function PackagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog } = useCatalog();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 18 }}>
        <BrandHeader eyebrow="Готові комплекси" title="Пакети 🎁" />
        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.clay} />
          <Text style={styles.noteText}>Ціни орієнтовні — остаточну суму підтвердить команда після заявки.</Text>
        </View>
      </View>

      <FlatList
        data={catalog.packages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: PartyPackage }) => (
          <PressCard
            style={styles.card}
            onPress={() => router.push({ pathname: '/details', params: { kind: 'package', id: item.id } })}
          >
            {item.hit ? (
              <View style={styles.hit}><Text style={styles.hitText}>ХІТ ЗАМОВЛЕНЬ</Text></View>
            ) : null}
            <View style={styles.head}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.sub}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.period}>/{item.period}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            {item.items.map((it, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={15} color={COLORS.green} />
                <Text style={styles.bulletText}>{it.text}</Text>
              </View>
            ))}
            <Pressable
              style={styles.bookBtn}
              onPress={() => router.push({ pathname: '/details', params: { kind: 'package', id: item.id } })}
            >
              <Text style={styles.bookBtnText}>Обрати пакет</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </Pressable>
          </PressCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: COLORS.paper2, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  noteText: { flex: 1, fontSize: 11, color: COLORS.muted, lineHeight: 16 },
  list: { paddingHorizontal: 18, paddingTop: 8 },
  card: { padding: 16, marginBottom: 14, ...SHADOWS.stamp },
  hit: { alignSelf: 'flex-start', backgroundColor: COLORS.clay, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, marginBottom: 10 },
  hitText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  head: { flexDirection: 'row', gap: 10 },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  sub: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  priceBox: { alignItems: 'flex-end', justifyContent: 'center' },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.clay },
  period: { fontSize: 10, color: COLORS.muted },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 12 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  bulletText: { flex: 1, fontSize: 12, color: COLORS.ink, lineHeight: 17 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.green, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 6 },
  bookBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
