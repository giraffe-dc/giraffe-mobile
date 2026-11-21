import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_CONSENT,
  getPrivacyConsent,
  hasAnswered,
  savePrivacyConsent,
  type PrivacyConsent,
} from '../services/privacy';
import { clearAnalyticsQueue } from '../services/analytics';

interface PrivacyState {
  consent: PrivacyConsent;
  hydrated: boolean;
  answered: boolean;
  /** Зберегти вибір; при вимкненні аналітики черга подій знищується. */
  update: (patch: Partial<Omit<PrivacyConsent, 'updatedAt'>>) => Promise<void>;
}

const PrivacyContext = createContext<PrivacyState | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<PrivacyConsent>({ ...DEFAULT_CONSENT });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getPrivacyConsent().then((value) => {
      if (!mounted) return;
      setConsent(value);
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<PrivacyState>(
    () => ({
      consent,
      hydrated,
      answered: hasAnswered(consent),
      update: async (patch) => {
        const next = await savePrivacyConsent(patch);
        setConsent(next);
        if (!next.analytics) await clearAnalyticsQueue();
      },
    }),
    [consent, hydrated],
  );

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy(): PrivacyState {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy має використовуватися всередині PrivacyProvider');
  return ctx;
}
