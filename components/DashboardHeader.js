import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";

export default function DashboardHeader({
  title,
  subtitle,
  userName,
  roleLabel,
}) {
  const initials = String(userName || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>LINPAL Premium Estates</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.userBlock}>
          <Text style={styles.userLabel}>Welcome back</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
        </View>

        <StatusBadge label={roleLabel} variant="neutral" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 18,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 8,
  },
  kicker: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: "rgba(15, 76, 92, 0.10)",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  userBlock: {
    flex: 1,
    gap: 4,
  },
  userLabel: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  userName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
