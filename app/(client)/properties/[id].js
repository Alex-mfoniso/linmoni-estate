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
import { favouriteApi } from "../../../services/favouriteApi";
import { conversationApi } from "../../../services/conversationApi";
import { propertyApi } from "../../../services/propertyApi";

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
  const [similar, setSimilar] = useState([]);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const propertyId = String(params.id || "");
        const [result, favorites, related] = await Promise.all([
          propertyApi.get(propertyId),
          favouriteApi.list({ page: 1, limit: 50 }),
          propertyApi.similar(propertyId),
        ]);
        if (active) {
          setProperty(result.property);
          setIsFavorited(favorites.items.some((item) => item.property.id === propertyId));
          setSimilar(related.items || []);
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
    if (!property || updatingFavorite) return;
    const previous = isFavorited;
    setIsFavorited(!previous);
    setUpdatingFavorite(true);
    try {
      await (previous ? favouriteApi.remove(property.id) : favouriteApi.add(property.id));
    } catch (err) {
      setIsFavorited(previous);
      Alert.alert("Favorites", err?.message || "Unable to update favorites.");
    } finally {
      setUpdatingFavorite(false);
    }
  }

  async function handleMessageRealtor() {
    if (!property || startingConversation) return;
    setStartingConversation(true);
    try {
      const { conversation } = await conversationApi.createForProperty(property.id);
      router.push(`/(client)/messages/${conversation.id}`);
    } catch (err) {
      Alert.alert("Messages", err?.message || "Unable to start this conversation.");
    } finally {
      setStartingConversation(false);
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
            <Text style={styles.metaKey}>Location</Text>
            <Text style={styles.metaValue}>{property.location || [property.city, property.state].filter(Boolean).join(", ")}</Text>
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

      {property.status !== "active" ? <Text style={styles.unavailableText}>This property is currently {property.status}; new inspections are unavailable.</Text> : null}
      <PrimaryButton title="Book inspection" onPress={handleBookInspection} disabled={property.status !== "active"} />
      <PrimaryButton title="Message realtor" variant="secondary" onPress={handleMessageRealtor} loading={startingConversation} />
      <PrimaryButton title="Back to listings" variant="ghost" onPress={() => router.back()} />

      {similar.length ? (
        <View style={styles.similarSection}>
          <Text style={styles.infoLabel}>Similar properties</Text>
          {similar.map((item) => <PropertyCard key={item.id} property={item} onView={() => router.push(`/(client)/properties/${item.id}`)} />)}
        </View>
      ) : null}

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
  unavailableText: { color: COLORS.warning, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  similarSection: { gap: 14, marginTop: 8 },
});
