import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import ScreenContainer from "./ScreenContainer";
import COLORS from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { conversationApi } from "../services/conversationApi";

export default function ClientChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const conversationId = String(id || "");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  async function load() {
    setError("");
    try {
      const [conversationResult, messageResult] = await Promise.all([
        conversationApi.list({ page: 1, limit: 50 }),
        conversationApi.messages(conversationId, { page: 1, limit: 50 }),
      ]);
      setConversation(conversationResult.items.find((item) => item.id === conversationId) || null);
      setMessages(messageResult.items || []);
      await conversationApi.markRead(conversationId);
    } catch (err) {
      setError(err?.message || "Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (conversationId) void load();
  }, [conversationId]);

  const ownProfileId = conversation?.client?.id;
  const partner = conversation?.realtor;
  const subtitle = useMemo(() => conversation?.property?.title || partner?.fullName || "Property conversation", [conversation, partner]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    const optimistic = { id: `pending-${Date.now()}`, senderId: ownProfileId, text, createdAt: new Date().toISOString(), readBy: [], pending: true };
    setDraft("");
    setMessages((current) => [...current, optimistic]);
    setSending(true);
    try {
      const result = await conversationApi.send(conversationId, text);
      setMessages((current) => current.map((item) => item.id === optimistic.id ? result.message : item));
    } catch (err) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setDraft(text);
      setError(err?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading chat..." />;
  if (!conversation) return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader title="Messages" subtitle="One-to-one property conversations." userName={currentUser?.displayName || userProfile?.fullName || "Client"} role="CLIENT" />
      <EmptyState title="Chat unavailable" description={error || "This conversation was not found."} actionLabel="Back to messages" onAction={() => router.replace("/(client)/messages")} />
    </ScreenContainer>
  );

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.screen}>
          <AppHeader title={partner?.fullName || "Messages"} subtitle={subtitle} userName={currentUser?.displayName || userProfile?.fullName || "Client"} role="CLIENT" />
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === ownProfileId} partnerName={partner?.fullName || "Realtor"} />}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={<EmptyState title="No messages yet" description="Send the first message about this property." />}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.refreshHint}>Messages refresh when this conversation opens.</Text>
          <MessageComposer value={draft} onChangeText={setDraft} onSend={handleSend} sending={sending} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14 },
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, gap: 12 },
  messages: { flexGrow: 1, justifyContent: "flex-end", paddingVertical: 8 },
  error: { color: COLORS.error, fontSize: 13, fontWeight: "700" },
  refreshHint: { color: COLORS.mutedText, fontSize: 11, textAlign: "center" },
});
