import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "../../../../components/AppHeader";
import AppInput from "../../../../components/AppInput";
import EmptyState from "../../../../components/EmptyState";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import PrimaryButton from "../../../../components/PrimaryButton";
import ScreenContainer from "../../../../components/ScreenContainer";
import COLORS from "../../../../constants/colors";
import { useAuth } from "../../../../contexts/AuthContext";
import { propertyApi } from "../../../../services/propertyApi";
import { bookingApi } from "../../../../services/bookingApi";

export default function ClientBookPropertyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setLoadError("");

      try {
        const result = await propertyApi.get(String(params.id || ""));
        if (active) {
          setProperty(result.property);
        }
      } catch (err) {
        if (active) {
          setLoadError(err?.message || "Could not load this property.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProperty();

    return () => {
      active = false;
    };
  }, [params.id]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit() {
    if (!property) {
      return;
    }

    if (!form.preferredDate.trim() || !form.preferredTime.trim()) {
      setFormError("Please choose a preferred date and time.");
      return;
    }
    const scheduledAt = new Date(`${form.preferredDate.trim()}T${form.preferredTime.trim()}:00+01:00`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setFormError("Choose a valid future date and time in WAT.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await bookingApi.create({
        propertyId: property.id,
        scheduledAt: scheduledAt.toISOString(),
        timezone: "Africa/Lagos",
        message: form.message,
      });

      Alert.alert("Booking requested", "Your inspection request has been submitted.");
      router.replace("/(client)/bookings");
    } catch (err) {
      setFormError(err?.message || "Unable to create this booking.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading booking form..." />;
  }

  if (loadError || !property) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Book Inspection"
          subtitle="Request a viewing for a property."
          userName={currentUser?.displayName || userProfile?.fullName || "Client"}
          role={(userProfile?.role || "client").toUpperCase()}
        />
        <EmptyState
          title="Could not load property"
          description={loadError || "This listing may have been removed."}
          actionLabel="Back to listings"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Book Inspection"
        subtitle={`Request a viewing for ${property.title}.`}
        userName={currentUser?.displayName || userProfile?.fullName || "Client"}
        role={(userProfile?.role || "client").toUpperCase()}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Property</Text>
        <Text style={styles.summaryTitle}>{property.title}</Text>
        <Text style={styles.summaryText}>{property.location || [property.city, property.state].filter(Boolean).join(", ")}</Text>
      </View>

      <View style={styles.formCard}>
        <AppInput
          label="Preferred Date"
          value={form.preferredDate}
          onChangeText={(value) => updateField("preferredDate", value)}
          placeholder="YYYY-MM-DD"
        />
        <AppInput
          label="Preferred Time"
          value={form.preferredTime}
          onChangeText={(value) => updateField("preferredTime", value)}
          placeholder="e.g. 10:00"
        />
        <AppInput
          label="Message"
          value={form.message}
          onChangeText={(value) => updateField("message", value)}
          placeholder="Add any details for the realtor"
          multiline
          numberOfLines={4}
          inputStyle={styles.messageInput}
        />

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <PrimaryButton
          title="Submit booking"
          onPress={handleSubmit}
          loading={saving}
        />
      </View>
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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 6,
  },
  summaryLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  summaryText: {
    color: COLORS.mutedText,
    fontSize: 14,
  },
  formCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  errorText: {
    marginBottom: 12,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
});
