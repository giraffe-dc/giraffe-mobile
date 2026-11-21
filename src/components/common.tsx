import { Text } from './AccessibleText';
import React from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, View, type StyleProp, type ViewStyle, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE, TEL } from '../constants/config';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export function Logo({ size = 40 }: { size?: number }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <View style={[styles.logoFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.55 }}>🦒</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: `${API_BASE}/brand/logo.png` }}
      style={{ width: size, height: size, borderRadius: RADIUS.sm }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

export function BrandHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandLeft}>
        <Logo size={42} />
        <View>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.brandTitle}>{title}</Text>
        </View>
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

export function RemoteImage({
  idOrPath,
  width = 800,
  style,
  placeholderIcon = 'image-outline',
}: {
  idOrPath?: string;
  width?: number;
  style?: StyleProp<ViewStyle>;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const [loading, setLoading] = React.useState(Boolean(idOrPath));
  const [failed, setFailed] = React.useState(false);
  const uri = idOrPath
    ? /^https?:\/\//i.test(idOrPath)
      ? idOrPath
      : `${API_BASE}/api/media/${String(idOrPath).replace(/^\/api\/media\//, '').replace(/^\//, '')}?w=${width}`
    : '';

  if (!uri || failed) {
    return (
      <View style={[styles.imagePlaceholder, style as ViewStyle]}>
        <Ionicons name={placeholderIcon} size={34} color={COLORS.muted} />
      </View>
    );
  }

  return (
    <View style={style as ViewStyle}>
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
      {loading ? (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="small" color={COLORS.ochre} />
        </View>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'clay' | 'ochre' | 'plain';
}) {
  const bg = {
    green: COLORS.green,
    clay: COLORS.clay,
    ochre: COLORS.ochre,
    plain: COLORS.paper2,
  }[tone];
  const color = tone === 'plain' ? COLORS.muted : COLORS.white;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function PressCard({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
      android_ripple={{ color: COLORS.paper2, borderless: false }}
    >
      {children}
    </Pressable>
  );
}

export function CallButton() {
  return (
    <Pressable style={styles.callBtn} onPress={() => void Linking.openURL(`tel:${TEL}`)}>
      <Ionicons name="call-outline" size={16} color={COLORS.white} />
      <Text style={styles.callBtnText}>Зателефонувати</Text>
    </Pressable>
  );
}

export function Stars({ count }: { count: number }) {
  return <Text style={styles.stars}>{'★'.repeat(count)}{'☆'.repeat(Math.max(0, 5 - count))}</Text>;
}

const styles = StyleSheet.create({
  logoFallback: { backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center' },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  eyebrow: { fontSize: 11, color: COLORS.clay, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: COLORS.ink, marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  imagePlaceholder: { backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imageLoader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.paper2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.clay, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  stars: { color: COLORS.ochre, fontSize: 16, letterSpacing: 2 },
});
