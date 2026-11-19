import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ServiceVariant } from '../types/catalog';

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
  setSelection: (selection: BookingSelection) => void;
  setVariant: (variantId: string, variantLabel: string, price: number) => void;
  updateForm: (updates: Partial<BookingForm>) => void;
  resetBooking: () => void;
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

const BookingContext = createContext<BookingState | null>(null);

/** Легкий аналог zustand-стора на React Context: жодних import.meta у веб-бандлі. */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<BookingSelection | null>(null);
  const [form, setForm] = useState<BookingForm>(initialForm);

  const value = useMemo<BookingState>(
    () => ({
      selection,
      form,
      setSelection: (next) => {
        setSelectionState(next);
        setForm((prev) => ({ ...prev, eventType: prev.eventType || next.format }));
      },
      setVariant: (variantId, variantLabel, price) =>
        setSelectionState((prev) =>
          prev ? { ...prev, variantId, variantLabel, price } : prev,
        ),
      updateForm: (updates) => setForm((prev) => ({ ...prev, ...updates })),
      resetBooking: () => {
        setSelectionState(null);
        setForm(initialForm);
      },
    }),
    [selection, form],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingStore(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingStore має використовуватися всередині BookingProvider');
  return ctx;
}
