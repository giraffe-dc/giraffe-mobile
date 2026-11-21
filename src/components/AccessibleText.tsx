import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps,
  type StyleProp,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAccessibility } from '../providers/AccessibilityProvider';

/**
 * Text із підтримкою налаштувань доступності (Етап 4, Фаза A):
 * масштабує `fontSize` зі стилю й підсилює низькоконтрастні кольори.
 * Використовується замість `Text` з react-native в основних екранах.
 */

/** Кольори, які при контрасті замінюються на темніші. */
const CONTRAST_MAP: Record<string, string> = {
  [COLORS.muted.toLowerCase()]: COLORS.ink,
  [COLORS.mutedLight.toLowerCase()]: COLORS.ink,
  [COLORS.line.toLowerCase()]: COLORS.ink,
};

function scaledColor(color: unknown, contrast: boolean): unknown {
  if (!contrast || typeof color !== 'string') return color;
  return CONTRAST_MAP[color.toLowerCase()] ?? color;
}

export function Text({ style, ...props }: TextProps) {
  const { fontScale, contrast } = useAccessibility();
  const flat = StyleSheet.flatten(style as StyleProp<TextProps['style']>) as
    | Record<string, unknown>
    | undefined;
  const baseSize =
    typeof flat?.fontSize === 'number' ? flat.fontSize : undefined;

  const override: Record<string, unknown> = {};
  if (fontScale !== 1) {
    override.fontSize = Math.round((baseSize ?? 14) * fontScale * 10) / 10;
  }
  if (contrast && typeof flat?.color === 'string') {
    const next = scaledColor(flat.color, true);
    if (next !== flat.color) override.color = next;
  }

  return (
    <RNText
      {...props}
      style={Object.keys(override).length ? [style, override] : style}
    />
  );
}
