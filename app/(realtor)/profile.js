import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import ProfileEditor from "../../components/ProfileEditor";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import LoadingSpinner from "../../components/LoadingSpinner";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { realtorApi } from "../../services/realtorApi";

export default function RealtorProfileScreen() {
  const router = useRouter();
  const { currentUser, userProfile, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Business profile input states
  const [bio, setBio] = useState("");
  const [agency, setAgency] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await realtorApi.getProfile();
      if (res && res.success && res.data) {
        const user = res.data;
        setProfile(user);
        setBio(user.bio || "");
        setAgency(user.agency || "");
        setSpecialties(user.specialties ? user.specialties.join(", ") : "");
        setServiceAreas(user.serviceAreas ? user.serviceAreas.join(", ") : "");
      } else {
        setError("Failed to fetch profile settings.");
      }
    } catch (err) {
      console.error("Realtor Profile fetch error:", err);
      setError(err?.message || "Could not connect to profile service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  async function handleSaveBasic(basicValues) {
    setSaving(true);
    setError("");

    try {
      const payload = {
        fullName: basicValues.fullName,
        phone: basicValues.phone,
        bio,
        agency,
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        serviceAreas: serviceAreas.split(",").map((a) => a.trim()).filter(Boolean),
      };

      const res = await realtorApi.updateProfile(payload);
      if (res && res.success) {
        Alert.alert("Success", "Your profile has been saved successfully.");
        setProfile(res.data);
      } else {
        throw new Error("Profile update failed.");
      }
    } catch (err) {
      setError(err?.message || "Unable to update your profile.");
      Alert.alert("Save failed", err?.message || "Could not update settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading && !profile) {
    return <LoadingSpinner label="Opening profile manager..." />;
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="My Realtor Office"
        subtitle="Configure your public agent bio, agency credentials, and regions."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      {profile ? (
        <View style={styles.body}>
          {/* 1. Basic details (renders initials, email, role, full name, phone) */}
          <ProfileEditor
            profile={profile}
            onSave={handleSaveBasic}
            saving={saving}
            error={error}
          />

          {/* 2. Realtor business specific details card */}
          <View style={styles.businessCard}>
            <Text style={styles.sectionLabel}>Agency & Credentials</Text>
            <AppInput
              label="Agency / Brokerage Name"
              value={agency}
              onChangeText={setAgency}
              placeholder="e.g. LINPAL Premium Lagos Ltd"
            />
            <AppInput
              label="Brief Professional Biography"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell clients about your expertise, years active, or achievements..."
              multiline
              inputStyle={styles.multiline}
            />
            <AppInput
              label="Specialties (comma-separated)"
              value={specialties}
              onChangeText={setSpecialties}
              placeholder="e.g. Luxury Rentals, Off-Plan Sales, Lands"
            />
            <AppInput
              label="Service Areas (comma-separated)"
              value={serviceAreas}
              onChangeText={setServiceAreas}
              placeholder="e.g. Ikoyi, Lekki Phase 1, Victoria Island"
            />
          </View>

          {/* Save Business Settings triggers basic detail save combining form states */}
          <PrimaryButton
            title={saving ? "Saving Brokerage Settings..." : "Save Agency Profile"}
            onPress={() => handleSaveBasic({ fullName: profile.fullName, phone: profile.phone })}
            loading={saving}
          />

          <View style={styles.footer}>
            <SecondaryButton title="Sign out" onPress={handleLogout} />
          </View>
        </View>
      ) : (
        <EmptyState
          title="Profile unavailable"
          description={error || "Your account details could not be loaded."}
          actionLabel="Retry Loading"
          onAction={fetchProfile}
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
  businessCard: {
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  multiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  footer: {
    marginTop: 10,
    marginBottom: 20,
  },
});
