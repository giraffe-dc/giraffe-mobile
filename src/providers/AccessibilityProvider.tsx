import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Доступність (Етап 4, Фаза A): масштаб шрифтів і підвищений контраст.
 *  Dark mode свідомо не робиться (окремий етап, ризик регресій UI). */

const KEY = 'giraffe-accessibility-v1';

export interface AccessibilityState {
  /** 1 = звичайний, 1.15 / 1.3 — збільшені. */
  fontScale: number;
  contrast: boolean;
  hydrated: boolean;
  setFontScale: (value: number) => void;
  toggleContrast: () => void;
}

interface Saved {
  fontScale?: number;
  contrast?: boolean;
}

const FONT_SCALES = [1, 1.15, 1.3] as const;

const AccessibilityContext = createContext<AccessibilityState | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState(1);
  const [contrast, setContrast] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      let saved: Saved = {};
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) saved = JSON.parse(raw) as Saved;
      } catch {
        // ignore
      }
      if (!mounted) return;
      const scale =
        typeof saved.fontScale === 'number' && FONT_SCALES.includes(saved.fontScale as 1)
          ? saved.fontScale
          : 1;
      setFontScaleState(scale);
      setContrast(saved.contrast === true);
      setHydrated(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (next: Saved) => {
    try {
      const current: Saved = { fontScale, contrast };
      await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...next }));
    } catch {
      // ignore
    }
  };

  const value = useMemo<AccessibilityState>(
    () => ({
      fontScale,
      contrast,
      hydrated,
      setFontScale: (next) => {
        const scale = FONT_SCALES.includes(next as 1)
          ? next
          : FONT_SCALES[0];
        setFontScaleState(scale);
        void persist({ fontScale: scale });
      },
      toggleContrast: () => {
        setContrast((prev) => {
          const next = !prev;
          void persist({ contrast: next });
          return next;
        });
      },
    }),
    [fontScale, contrast, hydrated],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityState {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility має використовуватися всередині AccessibilityProvider');
  }
  return ctx;
}
