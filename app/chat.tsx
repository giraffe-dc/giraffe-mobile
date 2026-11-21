import { Text } from '../src/components/AccessibleText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchChatHistory,
  makeThreadId,
  pollChat,
  sendChatMessage,
  type ChatMessage,
} from '../src/api/client';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useAuth } from '../src/providers/AuthProvider';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';

/**
 * Чат із командою (Етап 3, п. 6): ті самі /api/chat* що й на сайті.
 * threadId — випадковий capability, зберігається в AsyncStorage, щоб
 * діалог переживав перезапуск (на відміну від сесії у useRef).
 *
 * Відповіді операторів пишуться в чат сайту/Telegram і модеруються
 * виключно в адмінці сайту — окремого мобільного адміна немає.
 */

const THREAD_KEY = 'giraffe-chat-thread-v1';
const DEVICE_KEY = 'giraffe-chat-device-v1';
const POLL_MS = 7000;

function messageKey(m: ChatMessage, index: number): string {
  return m.id || `${m.createdAt ?? ''}-${index}`;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const knownIds = useRef<Set<string>>(new Set());

  // 1) Створюємо/відновлюємо threadId і deviceId (AsyncStorage, без нативних модулів).
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        let tid = await AsyncStorage.getItem(THREAD_KEY);
        let did = await AsyncStorage.getItem(DEVICE_KEY);
        if (!tid || !/^[A-Za-z0-9_-]{16,80}$/.test(tid)) {
          tid = makeThreadId();
          await AsyncStorage.setItem(THREAD_KEY, tid);
        }
        if (!did) {
          did = makeThreadId();
          await AsyncStorage.setItem(DEVICE_KEY, did);
        }
        if (!mounted) return;
        setThreadId(tid);
        setDeviceId(did);
        const history = await fetchChatHistory(tid);
        if (!mounted) return;
        knownIds.current = new Set(history.map((m, i) => messageKey(m, i)));
        setMessages(history);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const poll = useCallback(async () => {
    if (!threadId) return;
    const incoming = await pollChat(threadId);
    if (!incoming.length) return;
    const fresh = incoming.filter((m, i) => !knownIds.current.has(messageKey(m, i)));
    if (!fresh.length) return;
    fresh.forEach((m, i) => knownIds.current.add(messageKey(m, i)));
    setMessages((prev) => [...prev, ...fresh]);
  }, [threadId]);

  // 2) Полінг, поки екран відкритий, і миттєва перевірка при поверненні в додаток.
  useEffect(() => {
    if (!threadId) return;
    const timer = setInterval(() => void poll(), POLL_MS);
    const onState = (state: string) => {
      if (state === 'active') void poll();
    };
    const sub = AppState.addEventListener('change', onState);
    void poll();
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [threadId, poll]);

  const onSend = async () => {
    const value = text.trim();
    if (!value || !threadId || sending) return;
    setError(null);
    setSending(true);
    const result = await sendChatMessage({
      threadId,
      deviceId,
      text: value,
      clientName: auth.phone ? 'Клієнт додатка' : undefined,
      clientPhone: auth.phone ?? undefined,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error ?? 'Не вдалося надіслати');
      return;
    }
    setText('');
    // Місцеве повідомлення; серверний poll підтягне відповідь оператора.
    const local: ChatMessage = {
      id: `local_${Date.now()}`,
      role: 'client',
      content: value,
      createdAt: new Date().toISOString(),
    };
    knownIds.current.add(local.id);
    setMessages((prev) => [...prev, local]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Чат із командою" eyebrow="Жирафик на зв'язку" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Ionicons name="chatbubbles-outline" size={28} color={COLORS.green} />
            <Text style={styles.introTitle}>Напишіть нам</Text>
            <Text style={styles.introText}>
              Оператор відповість у Telegram-чат команди — тут ви побачите відповідь.
              Для термінових питань краще подзвонити.
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.green} style={styles.loader} />
          ) : null}

          {messages.map((m, i) => {
            const mine = m.role === 'client' || m.role === 'user';
            return (
              <View
                key={messageKey(m, i)}
                style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
              >
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
                  {m.content}
                </Text>
                {!mine ? (
                  <Text style={styles.bubbleAuthor}>
                    {m.adminName ?? m.author ?? 'Команда Жирафик'}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Напишіть повідомлення…"
            placeholderTextColor={COLORS.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            onSubmitEditing={() => void onSend()}
          />
          <Pressable
            style={[styles.send, (!text.trim() || sending) && styles.sendDisabled]}
            onPress={() => void onSend()}
            disabled={!text.trim() || sending || !threadId}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={19} color={COLORS.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  flex: { flex: 1 },
  messages: { padding: 18, paddingBottom: 24, flexGrow: 1 },
  intro: { alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.lg, padding: 18, marginBottom: 18, ...SHADOWS.card },
  introTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginTop: 8 },
  introText: { fontSize: 12, color: COLORS.muted, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  loader: { marginVertical: 18 },
  bubble: { maxWidth: '86%', padding: 12, borderRadius: RADIUS.md, marginBottom: 10 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: COLORS.green, borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, color: COLORS.ink, lineHeight: 19 },
  bubbleTextMine: { color: COLORS.white },
  bubbleAuthor: { fontSize: 10, color: COLORS.clay, fontWeight: '800', marginTop: 6 },
  error: { color: COLORS.danger, fontSize: 12, paddingHorizontal: 18, paddingBottom: 6 },
  composer: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', paddingTop: 10, paddingHorizontal: 14, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.line },
  input: { flex: 1, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.ink, maxHeight: 110 },
  send: { width: 44, height: 44, borderRadius: RADIUS.pill, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
});
