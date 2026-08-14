import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View, Text, ScrollView } from "react-native";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import ProfileEditor from "../../components/ProfileEditor";
import SecondaryButton from "../../components/SecondaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AdminProfileScreen() {
  const router = useRouter();
  const { currentUser, userProfile, logout, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values) {
    setSaving(true);
    setError("");

    try {
      await updateProfile(values);
      Alert.alert("Profile updated", "Your account details have been saved.");
    } catch (err) {
      setError(err?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title="Profile"
        subtitle="Manage secure administrative account settings."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      {userProfile ? (
        <ScrollView contentContainerStyle={styles.body}>
          {/* Admin security clearance indicator */}
          <View style={styles.clearanceCard}>
            <View style={styles.clearanceIconFrame}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clearanceTitle}>Full Administrative Clearance</Text>
              <Text style={styles.clearanceDesc}>
                This device holds active write clearance over global listings, roles, and settings.
              </Text>
            </View>
          </View>

          <ProfileEditor
            profile={userProfile}
            onSave={handleSave}
            saving={saving}
            error={error}
          />
          <View style={styles.footer}>
            <SecondaryButton title="Sign out securely" onPress={handleLogout} />
          </View>
        </ScrollView>
      ) : (
        <EmptyState
          title="Profile unavailable"
          description="Your account details could not be loaded."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 16
  },
  clearanceCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  clearanceIconFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.softPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14
  },
  clearanceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  clearanceDesc: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 2,
    lineHeight: 14,
    fontFamily: "Inter"
  },
  footer: {
    marginTop: 12
  }
});
