import { Text } from '../../src/components/AccessibleText';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../../src/providers/CatalogProvider';
import { BrandHeader, PressCard, RemoteImage } from '../../src/components/common';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import type { Service } from '../../src/types/catalog';

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog } = useCatalog();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Усі');

  const categories = useMemo(
    () => ['Усі', ...Array.from(new Set(catalog.services.map((s) => s.category).filter(Boolean)))],
    [catalog.services],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.services.filter((item) => {
      const inCategory = category === 'Усі' || item.category === category;
      const inQuery = !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [catalog.services, category, query]);

  const renderItem = ({ item }: { item: Service }) => {
    const first = item.variants?.[0];
    return (
      <PressCard
        onPress={() => router.push({ pathname: '/details', params: { kind: 'service', id: item.id } })}
        style={styles.card}
      >
        <View style={styles.imageWrap}>
          <RemoteImage idOrPath={item.images?.[0]} style={StyleSheet.absoluteFillObject} />
          {item.audiences?.[0] ? (
            <View style={styles.age}><Text style={styles.ageText}>{item.audiences[0]}</Text></View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={3}>{item.desc}</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>від</Text>
              <Text style={styles.price}>{first ? `${first.price} грн` : item.price ?? 'за запитом'}</Text>
            </View>
            <View style={styles.arrow}><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></View>
          </View>
        </View>
      </PressCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 18 }}>
        <BrandHeader eyebrow="Каталог" title="Послуги 🎈" />
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Пошук за назвою або описом"
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={COLORS.muted} /></Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.chip, category === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={COLORS.line} />
            <Text style={styles.emptyText}>Нічого не знайдено. Спробуйте інший запит.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md,
    paddingHorizontal: 12, marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 13, color: COLORS.ink },
  chipsScroll: { flexGrow: 0, marginBottom: 4 },
  chips: { paddingHorizontal: 18, paddingVertical: 6, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line },
  chipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  chipText: { fontSize: 11, fontWeight: '700', color: COLORS.muted },
  chipTextActive: { color: COLORS.white },
  list: { paddingHorizontal: 18, paddingTop: 10 },
  card: { flexDirection: 'row', marginBottom: 12, minHeight: 128 },
  imageWrap: { width: 118, backgroundColor: COLORS.paper2, position: 'relative' },
  age: { position: 'absolute', left: 6, top: 6, backgroundColor: COLORS.clay, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.pill },
  ageText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  body: { flex: 1, padding: 12 },
  category: { fontSize: 9, color: COLORS.clay, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 3 },
  desc: { fontSize: 11, color: COLORS.muted, lineHeight: 15, marginTop: 5 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' },
  priceLabel: { fontSize: 9, color: COLORS.muted },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.clay },
  arrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
});
