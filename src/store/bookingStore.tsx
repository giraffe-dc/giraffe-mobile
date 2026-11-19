import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalcItem, ServiceVariant } from '../types/catalog';

export interface BookingSelection {
  kind: 'service' | 'package';
  id: string;
  name: string;
  subtitle?: string;
  format: string;
  price?: number;
  priceLabel?: string;
  variantId?: string;
  variantLabel?: string;
  variants?: ServiceVariant[];
  image?: string;
}

export interface BookingForm {
  name: string;
  phone: string;
  date: string;
  time: string;
  address: string;
  childrenCount: string;
  notes: string;
  eventType: string;
}

interface BookingState {
  selection: BookingSelection | null;
  form: BookingForm;
  /** Позиції, зібрані в калькуляторі «Збери сам» / підборі програми. */
  calcItems: CalcItem[];
  /** Транспорт із калькулятора (в один бік), якщо вказана відстань. */
  transport?: CalcItem;
  /** Чернетку вже завантажено зі сховища (щоб не перезаписати порожнім). */
  hydrated: boolean;
  setSelection: (selection: BookingSelection) => void;
  setVariant: (variantId: string, variantLabel: string, price: number) => void;
  updateForm: (updates: Partial<BookingForm>) => void;
  /** Замінити позиції кошторису (калькулятор / підбір). */
  setCalcItems: (items: CalcItem[], transport?: CalcItem) => void;
  /** Прибрати позиції кошторису, залишивши форму. */
  clearCalc: () => void;
  resetBooking: () => void;
  /** Викликати після успішної відправки — чернетка більше не потрібна. */
  clearDraft: () => void;
}

const initialForm: BookingForm = {
  name: '',
  phone: '',
  date: '',
  time: '',
  address: '',
  childrenCount: '',
  notes: '',
  eventType: '',
};

/** Ключ чернетки в localStorage / AsyncStorage. */
const DRAFT_KEY = 'giraffe-booking-draft-v1';

interface Draft {
  form?: Partial<BookingForm>;
  selection?: BookingSelection | null;
  calcItems?: CalcItem[];
  transport?: CalcItem | null;
}

async function loadDraft(): Promise<Draft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

async function saveDraft(draft: Draft): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // сховище недоступне — просто не зберігаємо
  }
}

async function dropDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

const BookingContext = createContext<BookingState | null>(null);

/** Легкий аналог zustand-стора на React Context: жодних import.meta у веб-бандлі.
 *  Чернетка форми переживає перезавантаження (AsyncStorage / localStorage). */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<BookingSelection | null>(null);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [calcItems, setCalcItemsState] = useState<CalcItem[]>([]);
  const [transport, setTransport] = useState<CalcItem | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // 1) Відновлення чернетки при старті (один раз).
  useEffect(() => {
    let mounted = true;
    void loadDraft().then((draft) => {
      if (!mounted) return;
      if (draft) {
        if (draft.form) setForm((prev) => ({ ...prev, ...draft.form }));
        if (draft.selection) setSelectionState(draft.selection);
        if (Array.isArray(draft.calcItems)) setCalcItemsState(draft.calcItems);
        if (draft.transport) setTransport(draft.transport);
      }
      hydratedRef.current = true;
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Збереження після кожного зміну (але не раніше відновлення).
  useEffect(() => {
    if (!hydratedRef.current) return;
    void saveDraft({ form, selection, calcItems, transport: transport ?? null });
  }, [form, selection, calcItems, transport, hydrated]);

  const value = useMemo<BookingState>(
    () => ({
      selection,
      form,
      calcItems,
      transport,
      hydrated,
      setSelection: (next) => {
        setSelectionState(next);
        setForm((prev) => ({ ...prev, eventType: prev.eventType || next.format }));
      },
      setVariant: (variantId, variantLabel, price) =>
        setSelectionState((prev) =>
          prev ? { ...prev, variantId, variantLabel, price } : prev,
        ),
      updateForm: (updates) => setForm((prev) => ({ ...prev, ...updates })),
      setCalcItems: (items, nextTransport) => {
        setCalcItemsState(items);
        setTransport(nextTransport);
      },
      clearCalc: () => {
        setCalcItemsState([]);
        setTransport(undefined);
      },
      resetBooking: () => {
        setSelectionState(null);
        setForm(initialForm);
        setCalcItemsState([]);
        setTransport(undefined);
        void dropDraft();
      },
      clearDraft: () => {
        void dropDraft();
      },
    }),
    [selection, form, calcItems, transport, hydrated],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingStore(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingStore має використовуватися всередині BookingProvider');
  return ctx;
}
