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

export default function AdminPropertyDetailsScreen() {
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
          subtitle="Check any listing in the system."
          userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
          role={(userProfile?.role || "admin").toUpperCase()}
        />
        <EmptyState
          title="Property not found"
          description={error || "This record may have been removed."}
          actionLabel="Back to catalogue"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Property Details"
        subtitle="Review the shared property record."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      <ImageCarousel
        property={property}
        onPressImage={(index) => {
          setViewerIndex(index);
          setViewerVisible(true);
        }}
      />

      <PropertyCard property={property} />

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Management note</Text>
        <Text style={styles.infoText}>
          This screen is ready for broader admin controls in a later phase.
        </Text>
      </View>

      <PrimaryButton title="Back to catalogue" onPress={() => router.back()} />

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
});
