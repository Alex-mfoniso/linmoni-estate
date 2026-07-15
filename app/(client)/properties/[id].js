import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
import {
  addFavorite,
  isPropertyFavorited,
  removeFavorite,
} from "../../../services/favoriteService";
import { createOrGetConversation } from "../../../services/messageService";
import { getPropertyById } from "../../../services/propertyService";
import { getPropertyCoverUri } from "../../../utils/propertyMedia";

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

export default function ClientPropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const [item, favorited] = await Promise.all([
          getPropertyById(String(params.id || "")),
          isPropertyFavorited(currentUser?.uid, String(params.id || "")),
        ]);
        if (active) {
          setProperty(item);
          setIsFavorited(favorited);
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
  }, [currentUser?.uid, params.id]);

  function handleBookInspection() {
    router.push(`/(client)/properties/${property.id}/book`);
  }

  async function handleFavoriteToggle() {
    if (userProfile?.role !== "client" || !currentUser?.uid || !property) {
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(currentUser.uid, property.id);
        setIsFavorited(false);
      } else {
        await addFavorite({
          userId: currentUser.uid,
          userRole: userProfile?.role,
          propertyId: property.id,
          propertyTitle: property.title,
          propertyImage: getPropertyCoverUri(property, {
            width: 1200,
            height: 900,
            crop: "fill",
          }),
          propertyPrice: property.price,
          propertyAddress: property.address,
        });
        setIsFavorited(true);
      }
    } catch (err) {
      Alert.alert("Favorites", err?.message || "Unable to update favorites.");
    }
  }

  async function handleMessageRealtor() {
    if (!currentUser?.uid || !property?.createdBy) {
      return;
    }

    try {
      const conversation = await createOrGetConversation({
        participantIds: [currentUser.uid, property.createdBy],
        propertyId: property.id,
        propertyTitle: property.title,
        propertyAddress: property.address,
      });

      router.push(`/(client)/messages/${conversation.id}`);
    } catch (err) {
      Alert.alert("Messages", err?.message || "Unable to start this conversation.");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading property details..." />;
  }

  if (error || !property) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Property Details"
          subtitle="Open a listing for a closer look."
          userName={currentUser?.displayName || userProfile?.fullName || "Client"}
          role={(userProfile?.role || "client").toUpperCase()}
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
        subtitle="Review the listing, then save or book an inspection."
        userName={currentUser?.displayName || userProfile?.fullName || "Client"}
        role={(userProfile?.role || "client").toUpperCase()}
      />

      <ImageCarousel property={property} onPressImage={(index) => {
        setViewerIndex(index);
        setViewerVisible(true);
      }} />

      <PropertyCard property={property} onFavoriteToggle={handleFavoriteToggle} isFavorited={isFavorited} />

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Description</Text>
        <Text style={styles.infoText}>{property.description}</Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>Address</Text>
            <Text style={styles.metaValue}>{property.address}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>Created</Text>
            <Text style={styles.metaValue}>{formatDate(property.createdAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>Updated</Text>
            <Text style={styles.metaValue}>{formatDate(property.updatedAt)}</Text>
          </View>
        </View>
      </View>

      <PrimaryButton title="Book inspection" onPress={handleBookInspection} />
      <PrimaryButton title="Message realtor" variant="secondary" onPress={handleMessageRealtor} />
      <PrimaryButton title="Back to listings" variant="ghost" onPress={() => router.back()} />

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
    gap: 14,
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
  metaGrid: {
    gap: 12,
  },
  metaItem: {
    gap: 4,
  },
  metaKey: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
