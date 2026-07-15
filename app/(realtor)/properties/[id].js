import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import EmptyState from "../../../components/EmptyState";
import FullScreenImageViewer from "../../../components/FullScreenImageViewer";
import ImageCarousel from "../../../components/ImageCarousel";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PrimaryButton from "../../../components/PrimaryButton";
import PropertyCard from "../../../components/PropertyCard";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { getPropertyById } from "../../../services/propertyService";

function formatDate(value) {
  if (!value) {
    return "Unavailable";
  }

  return new Date(value).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RealtorPropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const item = await getPropertyById(String(params.id || ""));
        if (active) {
          setProperty(item);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load this property.");
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

  if (loading) {
    return <LoadingSpinner label="Loading property details..." />;
  }

  if (error || !property) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Property Details"
          subtitle="Review one of your listings."
          userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
          role={(userProfile?.role || "realtor").toUpperCase()}
        />
        <EmptyState
          title="Property not found"
          description={error || "This listing may have been removed."}
          actionLabel="Back to listings"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Property Details"
        subtitle="Inspect the record before making updates."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      <ImageCarousel
        property={property}
        onPressImage={(index) => {
          setViewerIndex(index);
          setViewerVisible(true);
        }}
      />

      <PropertyCard
        property={property}
        onPrimaryAction={() => router.push(`/(realtor)/properties/${property.id}/edit`)}
        primaryActionLabel="Edit property"
        onSecondaryAction={() => router.back()}
        secondaryActionLabel="Back"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Listing information</Text>
        <Text style={styles.infoText}>{property.description}</Text>
        <Text style={styles.metaLine}>Created: {formatDate(property.createdAt)}</Text>
        <Text style={styles.metaLine}>Updated: {formatDate(property.updatedAt)}</Text>
      </View>

      <PrimaryButton
        title="Edit property"
        onPress={() => router.push(`/(realtor)/properties/${property.id}/edit`)}
      />

      <FullScreenImageViewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        property={property}
        initialIndex={viewerIndex}
      />
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
  infoCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 10,
  },
  infoLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoText: {
    color: COLORS.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  metaLine: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
