import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import UnreadBadge from "./UnreadBadge";

function getInitials(name) {
  return String(name || "Chat")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CH";
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function ConversationCard({ conversation, currentUserId, onPress }) {
  const partner = conversation?.partnerProfile;
  const title = partner?.fullName || conversation?.propertyTitle || "Conversation";
  const subtitle = conversation?.propertyTitle
    ? conversation.propertyTitle
    : partner?.role || "Direct chat";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(title)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{formatTime(conversation?.lastMessageAt)}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>

        <Text style={styles.message} numberOfLines={2}>
          {conversation?.lastMessage || "No messages yet."}
        </Text>
      </View>

      <View style={styles.side}>
        <UnreadBadge count={conversation?.unreadCount || 0} />
        <Ionicons name="chevron-forward" size={18} color={COLORS.mutedText} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  time: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  message: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  side: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
