import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import StatusBadge from "./StatusBadge";
import { SHADOWS } from "../constants/theme";

function formatDate(value) {
  if (!value) {
    return "Unavailable";
  }

  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusVariant(status) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "completed":
      return "neutral";
    case "pending":
    default:
      return "warning";
  }
}

export default function BookingCard({
  booking,
  onViewProperty,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
}) {
  const status = booking?.status || "pending";
  const variant = getStatusVariant(status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {booking?.propertyTitle || "Untitled booking"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {booking?.clientName || "Client"}
          </Text>
        </View>
        <StatusBadge label={status} variant={variant} />
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {booking?.preferredDate || "Date unavailable"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {booking?.preferredTime || "Time unavailable"}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {booking?.message || "No message provided."}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Requested {formatDate(booking?.createdAt)}
        </Text>
      </View>

      <View style={styles.actions}>
        {onViewProperty ? (
          <Pressable onPress={onViewProperty} style={styles.actionGhost}>
            <Text style={styles.actionGhostText}>View property</Text>
          </Pressable>
        ) : null}
        {onPrimaryAction ? (
          <Pressable onPress={onPrimaryAction} style={styles.actionPrimary}>
            <Text style={styles.actionPrimaryText}>
              {primaryActionLabel || "Action"}
            </Text>
          </Pressable>
        ) : null}
        {onSecondaryAction ? (
          <Pressable onPress={onSecondaryAction} style={styles.actionSecondary}>
            <Text style={styles.actionSecondaryText}>
              {secondaryActionLabel || "More"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  detailsCard: {
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionGhost: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionGhostText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  actionPrimary: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  actionPrimaryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  actionSecondary: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionSecondaryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
});
