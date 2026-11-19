import { Platform, Share } from 'react-native';

export type ShareResult = 'shared' | 'copied' | 'failed';

/**
 * «Поділитися» текстом: системний share-sheet на APK/PWA (якщо браузер
 * підтримує navigator.share), інакше — копіювання в буфер обміну.
 */
export async function shareText(message: string): Promise<ShareResult> {
  if (Platform.OS === 'web') {
    const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ text: message });
        return 'shared';
      } catch {
        // користувач закрив share-sheet — пробуємо буфер обміну
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}
