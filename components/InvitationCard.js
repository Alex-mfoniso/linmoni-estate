import { Pressable, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";

export default function InvitationCard({
  invitation,
  onPress,
  onResend,
  onRevoke,
}) {
  const expiry = invitation?.expiresAt
    ? new Date(invitation.expiresAt).toLocaleDateString("en-NG")
    : "-";

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={({ pressed }) =>
        onPress
          ? [styles.card, pressed ? styles.pressed : null]
          : styles.card
      }
    >
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.name}>{invitation?.fullName || "Unnamed invitation"}</Text>
          <Text style={styles.email}>{invitation?.email || "No email"}</Text>
        </View>
        <StatusBadge label={invitation?.status || "-"} variant="neutral" />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Role: {invitation?.role || "-"}</Text>
        <Text style={styles.meta}>Expires: {expiry}</Text>
        <Text style={styles.meta}>Account: {String(invitation?.accountStatus || "active").toUpperCase()}</Text>
      </View>

      <View style={styles.actions}>
        {onResend ? (
          <Pressable onPress={onResend} style={styles.actionButton}>
            <Text style={styles.actionText}>Resend</Text>
          </Pressable>
        ) : null}
        {onRevoke ? (
          <Pressable onPress={onRevoke} style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionText, styles.dangerText]}>Revoke</Text>
          </Pressable>
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  email: {
    color: COLORS.mutedText,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  meta: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dangerButton: {
    backgroundColor: "rgba(214, 69, 69, 0.08)",
    borderColor: "rgba(214, 69, 69, 0.16)",
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  dangerText: {
    color: COLORS.error,
  },
});
