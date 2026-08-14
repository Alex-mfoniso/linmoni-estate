import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import MessageBubble from "../../../components/MessageBubble";
import MessageComposer from "../../../components/MessageComposer";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { realtorApi } from "../../../services/realtorApi";

export default function RealtorChatScreen() {
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
        realtorApi.getConversations({ page: 1, limit: 50 }),
        realtorApi.getMessages(conversationId, { page: 1, limit: 50 }),
      ]);

      const activeConvo = conversationResult.data?.items?.find((item) => item.id === conversationId) || null;
      setConversation(activeConvo);
      setMessages(messageResult.data?.items || []);
      await realtorApi.markRead(conversationId);
    } catch (err) {
      setError(err?.message || "Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (conversationId) void load();
  }, [conversationId]);

  const ownProfileId = userProfile?._id || userProfile?.id;
  const partner = conversation?.client;
  const subtitle = useMemo(() => conversation?.property?.title || partner?.fullName || "Client Conversation", [conversation, partner]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;

    const optimistic = {
      id: `pending-${Date.now()}`,
      senderId: ownProfileId,
      text,
      createdAt: new Date().toISOString(),
      readBy: [],
      pending: true
    };

    setDraft("");
    setMessages((current) => [...current, optimistic]);
    setSending(true);

    try {
      const result = await realtorApi.sendMessage(conversationId, text);
      if (result && result.success) {
        setMessages((current) =>
          current.map((item) => (item.id === optimistic.id ? result.data.message : item))
        );
      } else {
        throw new Error("Message submission failed.");
      }
    } catch (err) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setDraft(text);
      setError(err?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading chat history..." />;

  if (!conversation) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Conversations"
          subtitle="Direct client chat portal."
          userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
          role="REALTOR"
        />
        <EmptyState
          title="Chat unavailable"
          description={error || "This client conversation was not found."}
          actionLabel="Back to messages"
          onAction={() => router.replace("/(realtor)/messages")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          <AppHeader
            title={partner?.fullName || "Client Chat"}
            subtitle={subtitle}
            userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
            role="REALTOR"
          />
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.senderId === ownProfileId}
                partnerName={partner?.fullName || "Client"}
              />
            )}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <EmptyState
                title="No messages yet"
                description="Client is awaiting your introductory listing follow-up."
              />
            }
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.refreshHint}>Messages refresh when this conversation opens.</Text>
          <MessageComposer
            value={draft}
            onChangeText={setDraft}
            onSend={handleSend}
            sending={sending}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  error: {
    color: COLORS.primary,
    fontSize: 12,
    textAlign: "center",
    marginVertical: 4,
    fontWeight: "700",
  },
  refreshHint: {
    color: COLORS.placeholder,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "600",
  },
});
