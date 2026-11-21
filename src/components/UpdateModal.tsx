import { Text } from './AccessibleText';
import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppVersion } from '../api/client';
import { API_BASE } from '../constants/config';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export function UpdateModal({ version, onClose }: { version: AppVersion | null; onClose: () => void }) {
  if (!version) return null;

  const apkUrl = version.apkUrl.startsWith('http')
    ? version.apkUrl
    : `${API_BASE}${version.apkUrl}`;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="download-outline" size={34} color={COLORS.green} />
          </View>
          <Text style={styles.title}>Доступна нова версія</Text>
          <Text style={styles.subtitle}>
            Жирафик {version.versionName} · оновлено {version.publishedAt}
          </Text>

          {version.changelog.length ? (
            <ScrollView style={styles.changes}>
              {version.changelog.map((line, i) => (
                <Text key={`${i}-${line}`} style={styles.change}>
                  • {line}
                </Text>
              ))}
            </ScrollView>
          ) : null}

          <Pressable
            style={styles.download}
            onPress={() => {
              void Linking.openURL(apkUrl);
              onClose();
            }}
          >
            <Text style={styles.downloadText}>Завантажити оновлення</Text>
            <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
          </Pressable>
          <Pressable onPress={onClose} style={styles.later}>
            <Text style={styles.laterText}>Пізніше</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18,59,40,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 22, ...SHADOWS.stamp },
  icon: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 6 },
  changes: { maxHeight: 110, marginTop: 16 },
  change: { fontSize: 12, color: COLORS.ink, lineHeight: 18, marginBottom: 4 },
  download: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.green, paddingVertical: 13, borderRadius: RADIUS.md, marginTop: 20 },
  downloadText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  later: { paddingVertical: 12, alignItems: 'center' },
  laterText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
});
