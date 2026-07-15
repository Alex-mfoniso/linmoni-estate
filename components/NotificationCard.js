import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

function formatRelativeTime(value) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const ICONS = {
  message_received: "chatbubble-ellipses-outline",
  booking_created: "calendar-outline",
  booking_approved: "checkmark-circle-outline",
  booking_rejected: "close-circle-outline",
  booking_completed: "flag-outline",
  booking_cancelled: "remove-circle-outline",
  property_created: "business-outline",
  property_updated: "create-outline",
  property_status_changed: "swap-horizontal-outline",
  account_status_changed: "person-circle-outline",
  general: "notifications-outline",
};

export default function NotificationCard({
  notification,
  onPress,
  onMarkRead,
  onDelete,
}) {
  const isRead = Boolean(notification?.isRead);
  const iconName = ICONS[notification?.type] || ICONS.general;

  return (
    <View style={[styles.card, isRead ? styles.cardRead : styles.cardUnread]}>
      <Pressable onPress={onPress} style={styles.content}>
        <View style={[styles.iconWrap, isRead && styles.iconWrapRead]}>
          <Ionicons name={iconName} size={18} color={COLORS.primary} />
        </View>
        <View style={styles.textWrap}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {notification?.title}
            </Text>
            <Text style={styles.time}>{formatRelativeTime(notification?.createdAt)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {notification?.message}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        {!isRead ? (
          <Pressable onPress={onMarkRead} style={styles.actionButton}>
            <Text style={styles.actionText}>Mark read</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  cardUnread: {
    borderColor: "rgba(15, 76, 92, 0.18)",
    backgroundColor: "rgba(15, 76, 92, 0.04)",
  },
  cardRead: {
    borderColor: COLORS.border,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  iconWrapRead: {
    opacity: 0.8,
  },
  textWrap: {
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
    fontSize: 14,
    fontWeight: "900",
  },
  time: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  message: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.softPrimary,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  deleteButton: {
    backgroundColor: COLORS.inputBackground,
  },
  deleteText: {
    color: COLORS.text,
  },
});
