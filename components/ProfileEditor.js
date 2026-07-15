import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppInput from "./AppInput";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import StatusBadge from "./StatusBadge";
import COLORS from "../constants/colors";
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

export default function ProfileEditor({
  profile,
  onSave,
  saving = false,
  error = "",
}) {
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  useEffect(() => {
    setFullName(profile?.fullName || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  async function handleSave() {
    await onSave?.({
      fullName,
      phone,
    });
  }

  function handleReset() {
    setFullName(profile?.fullName || "");
    setPhone(profile?.phone || "");
  }

  const initials = (profile?.fullName || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.identityCopy}>
          <Text style={styles.name}>{profile?.fullName || "User profile"}</Text>
          <Text style={styles.email}>{profile?.email || "No email available"}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge label={profile?.role || "-"} variant="neutral" />
            <StatusBadge
              label={profile?.status || "-"}
              variant={String(profile?.status || "").toLowerCase() === "active" ? "success" : "subtle"}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit profile</Text>

        <AppInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />
        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
        />

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <View style={styles.metaLabelRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.metaKey}>Created</Text>
            </View>
            <Text style={styles.metaValue}>{formatDate(profile?.createdAt)}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <SecondaryButton
            title="Reset"
            onPress={handleReset}
            containerStyle={styles.actionButton}
          />
          <PrimaryButton
            title="Save profile"
            onPress={handleSave}
            loading={saving}
            containerStyle={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 18,
    ...SHADOWS.card,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: "rgba(15, 76, 92, 0.12)",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  identityCopy: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  email: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaGrid: {
    gap: 12,
  },
  metaItem: {
    gap: 4,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
  },
  metaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaKey: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
