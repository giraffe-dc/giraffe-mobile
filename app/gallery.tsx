import React, { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../src/providers/CatalogProvider';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { GalleryImage } from '../src/components/GalleryImage';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { GALLERY_CATEGORY_LABELS } from '../src/utils/format';
import { API_BASE } from '../src/constants/config';
import type { GalleryAlbum } from '../src/types/catalog';

/** Галерея з альбомами: фільтри за категоріями, перегляд фото на весь екран, відео. */
export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catalog } = useCatalog();
  const [category, setCategory] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ album: GalleryAlbum; index: number } | null>(null);

  const albums = catalog.gallery;
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return albums.map((a) => a.category).filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
  }, [albums]);

  const visible = category ? albums.filter((a) => a.category === category) : albums;
  // Спершу рекомендовані — як на сайті.
  const sorted = [...visible].sort((a, b) => Number(b.featured ?? 0) - Number(a.featured ?? 0));

  const openViewer = (album: GalleryAlbum, index: number) => setViewer({ album, index });
  const step = (delta: number) =>
    setViewer((prev) =>
      prev
        ? {
            ...prev,
            index: (prev.index + delta + prev.album.images.length) % prev.album.images.length,
          }
        : null,
    );

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow={`${albums.length} альбомів зі свят`} title="Галерея 📸" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ФІЛЬТРИ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Pressable
            style={[styles.chip, category === null && styles.chipActive]}
            onPress={() => setCategory(null)}
          >
            <Text style={[styles.chipText, category === null && styles.chipTextActive]}>Усі</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {GALLERY_CATEGORY_LABELS[c] ?? c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {sorted.map((album) => (
          <View key={album.id} style={styles.album}>
            <View style={styles.albumHead}>
              <View style={{ flex: 1 }}>
                <View style={styles.albumTitleRow}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  {album.featured ? (
                    <View style={styles.featured}>
                      <Text style={styles.featuredText}>ХІТ</Text>
                    </View>
                  ) : null}
                </View>
                {album.summary ? <Text style={styles.albumSummary}>{album.summary}</Text> : null}
              </View>
            </View>
            {album.serviceLabel ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{album.serviceLabel}</Text>
              </View>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
              {album.images.map((img, i) => (
                <Pressable key={`${album.id}-${i}`} style={styles.thumb} onPress={() => openViewer(album, i)}>
                  <GalleryImage path={img} width={600} style={StyleSheet.absoluteFillObject} />
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.albumActions}>
              {album.videoUrl ? (
                <Pressable
                  style={styles.videoBtn}
                  onPress={() => void Linking.openURL(`${API_BASE}${album.videoUrl}`)}
                >
                  <Ionicons name="play-circle-outline" size={16} color={COLORS.white} />
                  <Text style={styles.videoBtnText}>Дивитися відео</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.detailsBtn, !album.serviceRef && styles.detailsBtnDisabled]}
                onPress={() => {
                  const idx = album.serviceRef.indexOf(':');
                  const kind = idx > 0 ? album.serviceRef.slice(0, idx) : '';
                  const id = idx > 0 ? album.serviceRef.slice(idx + 1) : '';
                  if ((kind === 'service' || kind === 'package') && id) {
                    router.push({ pathname: '/details', params: { kind, id } });
                  }
                }}
                disabled={!album.serviceRef}
              >
                <Text style={styles.detailsBtnText}>{album.serviceLabel || 'Програма'}</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!sorted.length ? <Text style={styles.empty}>Галерея поки що порожня.</Text> : null}
      </ScrollView>

      {/* ПЕРЕГЛЯД НА ВЕСЬ ЕКРАН */}
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={[styles.viewer, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.viewerHead}>
            <Text style={styles.viewerTitle} numberOfLines={1}>{viewer?.album.title}</Text>
            <Pressable onPress={() => setViewer(null)} hitSlop={10}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </Pressable>
          </View>

          {viewer ? (
            <>
              <View style={styles.viewerImageWrap}>
                <GalleryImage
                  path={viewer.album.images[viewer.index]}
                  width={1400}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
              <View style={styles.viewerNav}>
                <Pressable style={styles.viewerBtn} onPress={() => step(-1)}>
                  <Ionicons name="chevron-back" size={26} color={COLORS.white} />
                </Pressable>
                <Text style={styles.viewerCounter}>
                  {viewer.index + 1} / {viewer.album.images.length}
                </Text>
                <Pressable style={styles.viewerBtn} onPress={() => step(1)}>
                  <Ionicons name="chevron-forward" size={26} color={COLORS.white} />
                </Pressable>
              </View>
              {viewer.album.summary ? <Text style={styles.viewerSummary}>{viewer.album.summary}</Text> : null}
            </>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 },
  chips: { gap: 8, paddingBottom: 12 },
  chip: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.ink },
  chipTextActive: { color: COLORS.white },
  album: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 14, marginBottom: 14, ...SHADOWS.card },
  albumHead: { flexDirection: 'row', gap: 10 },
  albumTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  albumTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, flexShrink: 1 },
  featured: { backgroundColor: COLORS.clay, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill },
  featuredText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  albumSummary: { fontSize: 12, lineHeight: 17, color: COLORS.muted, marginTop: 4 },
  tag: { alignSelf: 'flex-start', backgroundColor: COLORS.paper2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill, marginTop: 10 },
  tagText: { fontSize: 10, fontWeight: '800', color: COLORS.green },
  strip: { gap: 10, paddingTop: 12 },
  thumb: { width: 160, height: 120, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.paper2 },
  albumActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.ink, paddingVertical: 9, paddingHorizontal: 14, borderRadius: RADIUS.md },
  videoBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  detailsBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line },
  detailsBtnDisabled: { opacity: 0.5 },
  detailsBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.green },
  empty: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 30 },
  viewer: { flex: 1, backgroundColor: 'rgba(12,24,18,0.96)', paddingHorizontal: 18 },
  viewerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  viewerTitle: { flex: 1, color: COLORS.white, fontSize: 16, fontWeight: '800' },
  viewerImageWrap: { flex: 1, marginVertical: 16, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: '#000' },
  viewerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  viewerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  viewerCounter: { color: COLORS.white, fontSize: 14, fontWeight: '800', minWidth: 60, textAlign: 'center' },
  viewerSummary: { color: COLORS.mutedLight, fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 17 },
});
