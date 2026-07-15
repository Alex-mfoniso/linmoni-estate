import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import ScreenContainer from "./ScreenContainer";
import StatusBadge from "./StatusBadge";
import COLORS from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import {
  getConversationById,
  markConversationMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "../services/messageService";

export default function ChatScreen({ routePrefix, title = "Messages" }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastReadMessageIdRef = useRef("");

  const conversationId = String(params.id || "");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function loadConversation() {
      setLoading(true);
      setError("");

      try {
        const item = await getConversationById(conversationId);
        if (!item) {
          if (active) {
            setConversation(null);
            setMessages([]);
            setError("Conversation not found.");
            setLoading(false);
          }
          return;
        }

        if (!item.participantIds.includes(currentUser?.uid || "")) {
          if (active) {
            setConversation(null);
            setMessages([]);
            setError("You do not have access to this conversation.");
            setLoading(false);
          }
          return;
        }

        if (active) {
          setConversation(item);
        }

        unsubscribe = await subscribeToMessages(conversationId, (items) => {
          if (!active) {
            return;
          }

          setMessages(Array.isArray(items) ? items : []);
          setLoading(false);
        });
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load this conversation.");
          setLoading(false);
        }
      }
    }

    if (conversationId && currentUser?.uid) {
      void loadConversation();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [conversationId, currentUser?.uid]);

  useEffect(() => {
    const latestMessageId = messages[messages.length - 1]?.id || "";

    if (
      !conversationId ||
      !currentUser?.uid ||
      !latestMessageId ||
      lastReadMessageIdRef.current === latestMessageId
    ) {
      return;
    }

    lastReadMessageIdRef.current = latestMessageId;
    void markConversationMessagesAsRead(conversationId, currentUser.uid);
  }, [conversationId, currentUser?.uid, messages]);

  const partner = useMemo(() => {
    if (!conversation) {
      return null;
    }

    return (
      conversation.participantProfiles.find((profile) => profile.uid !== currentUser?.uid) ||
      conversation.participantProfiles[0] ||
      null
    );
  }, [conversation, currentUser?.uid]);

  async function handleSend() {
    if (!draft.trim() || sending || !conversationId || !currentUser?.uid) {
      return;
    }

    try {
      setSending(true);
      await sendMessage({
        conversationId,
        senderId: currentUser.uid,
        text: draft,
      });
      setDraft("");
    } catch (err) {
      setError(err?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading chat..." />;
  }

  if (error && !conversation) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title={title}
          subtitle="One-to-one chat is available here."
          userName={currentUser?.displayName || userProfile?.fullName || "Member"}
          role={(userProfile?.role || "").toUpperCase()}
        />
        <EmptyState
          title="Chat unavailable"
          description={error}
          actionLabel="Back to messages"
          onAction={() => router.push(`${routePrefix}/messages`)}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={12}
      >
        <View style={styles.screen}>
          <AppHeader
            title={title}
            subtitle={conversation?.propertyTitle || partner?.fullName || "Direct message"}
            userName={currentUser?.displayName || userProfile?.fullName || "Member"}
            role={(userProfile?.role || "").toUpperCase()}
          />

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Conversation</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaTitle} numberOfLines={1}>
                {partner?.fullName || "Conversation"}
              </Text>
              {partner?.role ? <StatusBadge label={partner.role} variant="neutral" /> : null}
            </View>
            {conversation?.propertyTitle ? (
              <Text style={styles.metaSubtitle} numberOfLines={1}>
                {conversation.propertyTitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.messagesWrap}>
            <FlatList
              style={styles.messageList}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isMine={item.senderId === currentUser?.uid}
                  partnerName={partner?.fullName || ""}
                />
              )}
              contentContainerStyle={styles.messages}
              ListEmptyComponent={
                <EmptyState
                  title="No messages yet"
                  description="Send the first message to start the conversation."
                />
              }
            />
          </View>

          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          <MessageComposer
            value={draft}
            onChangeText={setDraft}
            onSend={handleSend}
            sending={sending}
            disabled={!conversation}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 14,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  metaCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  metaLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metaTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  metaSubtitle: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  messagesWrap: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messages: {
    paddingBottom: 8,
    gap: 0,
  },
  inlineError: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
});
