import { Text } from './AccessibleText';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchSurveyResults,
  submitSurvey,
  voteSurvey,
  type Survey,
  type SurveyResults,
} from '../api/client';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

/**
 * Легкий poll після свята (Етап 3, п. 7). Дані опитування живуть у новині
 * сайту (`survey`), результати й відповіді — у адмінці сайту. У додатку
 * лише форма: варіанти (голос) або довільні поля (відповідь).
 */
export function SurveyCard({ newsId, survey }: { newsId: string; survey: Survey }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);

  const options = survey.options ?? [];
  const fields = survey.fields ?? [];
  const expired = Boolean(
    survey.endDate && new Date(survey.endDate).getTime() <= Date.now(),
  );

  const toggleOption = (id: string) => {
    if (survey.allowMultiple) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelected([id]);
    }
  };

  const submit = async () => {
    setError(null);
    if (options.length) {
      if (!selected.length) {
        setError('Виберіть хоча б один варіант');
        return;
      }
      setSending(true);
      const res = await voteSurvey(newsId, selected);
      setSending(false);
      if (!res.ok) {
        setError(res.error ?? 'Не вдалося проголосувати');
        return;
      }
    } else {
      const empty = fields.find((f) => !(answers[f.id] ?? '').trim());
      if (fields.length && empty) {
        setError(`Заповніть: ${empty.label}`);
        return;
      }
      setSending(true);
      const res = await submitSurvey(newsId, answers);
      setSending(false);
      if (!res.ok) {
        setError(res.error ?? 'Не вдалося надіслати відповідь');
        return;
      }
    }
    setDone(true);
    const r = await fetchSurveyResults(newsId);
    if (r) setResults(r);
  };

  if (expired && !results) {
    return (
      <View style={styles.card}>
        <Text style={styles.question}>{survey.question}</Text>
        <Text style={styles.muted}>Опитування завершено.</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.card}
      onStartShouldSetResponder={() => true}
    >
      <View style={styles.head}>
        <Ionicons name="clipboard-outline" size={18} color={COLORS.clay} />
        <Text style={styles.headLabel}>Опитування</Text>
      </View>
      <Text style={styles.question}>{survey.question}</Text>

      {done ? (
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={26} color={COLORS.green} />
          <Text style={styles.doneText}>Дякуємо за відповідь!</Text>
          {results ? (
            <Text style={styles.results}>
              Голосів: {results.totalVotes}
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          {options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => toggleOption(opt.id)}
                disabled={expired}
              >
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={active ? COLORS.green : COLORS.muted}
                />
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.text}
                </Text>
              </Pressable>
            );
          })}

          {fields.map((field) => (
            <View key={field.id} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={answers[field.id] ?? ''}
                onChangeText={(value) =>
                  setAnswers((prev) => ({ ...prev, [field.id]: value }))
                }
                placeholder="Ваша відповідь"
                placeholderTextColor={COLORS.muted}
                maxLength={500}
              />
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.submit, sending && { opacity: 0.7 }]}
            onPress={() => void submit()}
            disabled={sending || expired}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitText}>Надіслати відповідь</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.paper2, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, padding: 13, marginTop: 12, ...SHADOWS.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  headLabel: { fontSize: 10, fontWeight: '800', color: COLORS.clay, textTransform: 'uppercase', letterSpacing: 1 },
  question: { fontSize: 13, fontWeight: '800', color: COLORS.ink, marginBottom: 10, lineHeight: 19 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm, padding: 10, marginBottom: 7 },
  optionActive: { borderColor: COLORS.green, backgroundColor: '#E7F2EC' },
  optionText: { flex: 1, fontSize: 12, color: COLORS.ink },
  optionTextActive: { fontWeight: '800', color: COLORS.green },
  fieldWrap: { marginBottom: 9 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, marginBottom: 5 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, color: COLORS.ink },
  submit: { backgroundColor: COLORS.green, borderRadius: RADIUS.sm, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  submitText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  error: { color: COLORS.danger, fontSize: 11, marginBottom: 7 },
  done: { alignItems: 'center', paddingVertical: 10 },
  doneText: { color: COLORS.green, fontWeight: '800', fontSize: 13, marginTop: 6 },
  results: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  muted: { fontSize: 12, color: COLORS.muted },
});
