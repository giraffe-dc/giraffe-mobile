import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

/** Локалізований підпис дати: «25 грудня 2026». */
function formatDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1]?.toLowerCase();
  return month ? `${Number(m[3])} ${month} ${m[1]}` : null;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Сітка календаря на місяць (понеділок — перший день тижня). */
function buildMonth(year: number, month: number): Array<Array<Date | null>> {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // 0 = понеділок
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * Вибір дати свята: календар у модалці, значення — рядок `РРРР-ММ-ДД`.
 * Один компонент для APK і PWA (робота без нативних залежностей).
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Оберіть дату',
  min,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  /** Мінімальна дата (за замовчуванням — сьогодні). */
  min?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => {
    const m = min ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(min) : null;
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : today;
  }, [min, today]);

  const initial = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : today;
  }, [value, today]);

  const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [selected, setSelected] = useState<string>(value);

  const weeks = useMemo(() => buildMonth(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const pretty = formatDate(value);

  const shiftMonth = (delta: number) =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const openPicker = () => {
    setSelected(value);
    setCursor(new Date(initial.getFullYear(), initial.getMonth(), 1));
    setOpen(true);
  };

  const confirm = (iso: string) => {
    setSelected(iso);
    onChange(iso);
    setOpen(false);
  };

  return (
    <>
      <Pressable style={styles.field} onPress={openPicker}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.green} />
        <Text style={[styles.fieldText, !pretty && styles.fieldPlaceholder]}>
          {pretty ?? placeholder}
        </Text>
        {value ? (
          <Pressable
            hitSlop={8}
            onPress={() => {
              setSelected('');
              onChange('');
            }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Pressable style={styles.navBtn} onPress={() => shiftMonth(-1)} hitSlop={6}>
                <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
              </Pressable>
              <Text style={styles.headerTitle}>
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </Text>
              <Pressable style={styles.navBtn} onPress={() => shiftMonth(1)} hitSlop={6}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.ink} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={styles.weekday}>{w}</Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                  if (!day) return <View key={di} style={styles.dayCell} />;
                  const iso = toIso(day);
                  const isPast = day < minDate;
                  const isToday = iso === toIso(today);
                  const isSelected = iso === selected;
                  return (
                    <Pressable
                      key={di}
                      style={[styles.dayCell, isSelected && styles.daySelected, !isSelected && isToday && styles.dayToday]}
                      disabled={isPast}
                      onPress={() => confirm(iso)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isPast && styles.dayPast,
                          isSelected && styles.dayTextSelected,
                          !isSelected && isToday && styles.dayTextToday,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <View style={styles.actions}>
              <Pressable
                style={styles.actionGhost}
                onPress={() => {
                  setSelected('');
                  onChange('');
                  setOpen(false);
                }}
              >
                <Text style={styles.actionGhostText}>Очистити</Text>
              </Pressable>
              <Pressable style={styles.actionPrimary} onPress={() => setOpen(false)}>
                <Text style={styles.actionPrimaryText}>Готово</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const CELL = 40;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldText: { flex: 1, fontSize: 14, color: COLORS.ink, fontWeight: '600' },
  fieldPlaceholder: { color: COLORS.muted, fontWeight: '400' },
  backdrop: { flex: 1, backgroundColor: 'rgba(18,59,40,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 16, width: '100%', maxWidth: 380, ...SHADOWS.stamp },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.paper2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekday: { width: CELL, textAlign: 'center', fontSize: 11, fontWeight: '800', color: COLORS.muted, marginBottom: 4 },
  dayCell: { width: CELL, height: CELL, borderRadius: CELL / 2, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  daySelected: { backgroundColor: COLORS.green },
  dayToday: { borderWidth: 1, borderColor: COLORS.green },
  dayText: { fontSize: 14, fontWeight: '600', color: COLORS.ink },
  dayTextSelected: { color: COLORS.white, fontWeight: '800' },
  dayTextToday: { color: COLORS.green, fontWeight: '800' },
  dayPast: { color: COLORS.line },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionGhost: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line },
  actionGhostText: { fontSize: 14, fontWeight: '700', color: COLORS.muted },
  actionPrimary: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.green },
  actionPrimaryText: { fontSize: 14, fontWeight: '800', color: COLORS.white },
});
