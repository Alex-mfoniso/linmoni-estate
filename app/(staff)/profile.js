import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import ProfileEditor from "../../components/ProfileEditor";
import SecondaryButton from "../../components/SecondaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../contexts/AuthContext";

export default function StaffProfileScreen() {
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
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Profile"
        subtitle="View your staff account details."
        userName={currentUser?.displayName || userProfile?.fullName || "Staff"}
        role={(userProfile?.role || "staff").toUpperCase()}
      />

      {userProfile ? (
        <View style={styles.body}>
          <ProfileEditor
            profile={userProfile}
            onSave={handleSave}
            saving={saving}
            error={error}
          />
          <View style={styles.footer}>
            <SecondaryButton title="Sign out" onPress={handleLogout} />
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  body: {
    flex: 1,
    gap: 14,
  },
  footer: {
    marginTop: "auto",
  },
});
