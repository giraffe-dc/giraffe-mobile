import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { API_BASE } from '../constants/config';
import { COLORS } from '../constants/theme';

/** Повний URL картинки галереї: статичні шляхи сайту (`/brand/...`),
 *  медіа-ідентифікатори (`/api/media/...`) або абсолютні посилання. */
export function mediaUrl(path: string, width = 800): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/api/media/')) return `${API_BASE}${path}?w=${width}`;
  if (path.startsWith('/brand/')) return `${API_BASE}${path}`;
  return `${API_BASE}/api/media/${path.replace(/^\//, '')}?w=${width}`;
}

/**
 * Картинка галереї: SVG малюємо `SvgUri` (нативний Image не вміє SVG),
 * звичайні растрові — `Image`. Один компонент для APK і PWA.
 */
export function GalleryImage({
  path,
  width = 800,
  style,
}: {
  path: string;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const uri = mediaUrl(path, width);
  const isSvg = /\.svg($|\?)/i.test(uri);

  if (!uri || failed) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <View style={style}>
      {isSvg ? (
        <SvgUri
          uri={uri}
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFillObject as never}
          onLoad={() => setLoading(false)}
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={StyleSheet.absoluteFillObject}
          onLoadEnd={() => setLoading(false)}
          onError={() => setFailed(true)}
        />
      )}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={COLORS.ochre} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: COLORS.paper2 },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.paper2 },
});
