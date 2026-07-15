import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import StatusBadge from "./StatusBadge";
import { SHADOWS } from "../constants/theme";

export default function UserCard({ user, onPress }) {
  const initials = (user?.fullName || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
      >
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{user?.fullName || "Unknown user"}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.mutedText} />
            </View>
            <Text style={styles.email}>{user?.email || "No email available"}</Text>
            <Text style={styles.phone}>{user?.phone || "No phone available"}</Text>
            <View style={styles.badgeRow}>
              <StatusBadge label={user?.role || "-"} variant="neutral" />
              <StatusBadge
                label={user?.status || "-"}
                variant={String(user?.status || "").toLowerCase() === "active" ? "success" : "subtle"}
              />
              {user?.mustChangePassword ? (
                <StatusBadge label="must change password" variant="warning" />
              ) : null}
              {user?.creationMethod ? (
                <StatusBadge label={user.creationMethod} variant="subtle" />
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{user?.fullName || "Unknown user"}</Text>
          <Text style={styles.email}>{user?.email || "No email available"}</Text>
          <Text style={styles.phone}>{user?.phone || "No phone available"}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge label={user?.role || "-"} variant="neutral" />
            <StatusBadge
              label={user?.status || "-"}
              variant={String(user?.status || "").toLowerCase() === "active" ? "success" : "subtle"}
            />
            {user?.mustChangePassword ? (
              <StatusBadge label="must change password" variant="warning" />
            ) : null}
            {user?.creationMethod ? (
              <StatusBadge label={user.creationMethod} variant="subtle" />
            ) : null}
          </View>
        </View>
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
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: "rgba(15, 76, 92, 0.12)",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  email: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  phone: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
});
