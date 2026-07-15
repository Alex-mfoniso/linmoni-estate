import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import NotificationBadge from "./NotificationBadge";

export default function AppHeader({
  title,
  subtitle,
  userName,
  role,
  notificationCount = 0,
  onNotificationPress,
  actionLabel = "Sign out",
  onAction,
}) {
  const initials = String(userName || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>LINPAL Premium Estates</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.userPill}>
          <Text style={styles.userLabel}>Signed in as</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.role}>{role}</Text>
        </View>

        <View style={styles.actions}>
          {onNotificationPress ? (
            <Pressable onPress={onNotificationPress} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              {notificationCount > 0 ? (
                <View style={styles.badgeWrap}>
                  <NotificationBadge count={notificationCount} />
                </View>
              ) : null}
            </Pressable>
          ) : null}

          {onAction ? (
            <Pressable onPress={onAction} style={styles.actionButton}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.white} />
              <Text style={styles.actionText}>{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    gap: 14,
  },
  hero: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  copy: {
    gap: 8,
  },
  kicker: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  avatarWrap: {
    position: "absolute",
    right: -8,
    top: -8,
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: "rgba(15, 76, 92, 0.12)",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeWrap: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  userPill: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  userLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  userName: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  role: {
    marginTop: 4,
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
