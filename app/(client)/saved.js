import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrimaryButton from "../../components/PrimaryButton";
import PropertyCard from "../../components/PropertyCard";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { removeFavorite, getUserFavorites } from "../../services/favoriteService";

export default function ClientSavedScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [pendingRemove, setPendingRemove] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadFavorites() {
      setLoading(true);
      setError("");

      try {
        const items = await getUserFavorites(currentUser?.uid);
        if (active) {
          setFavorites(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load saved properties.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadFavorites();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, refreshTick]);

  async function confirmRemove() {
    if (!pendingRemove) {
      return;
    }

    try {
      await removeFavorite(currentUser?.uid, pendingRemove.propertyId);
      setPendingRemove(null);
      setRefreshTick((value) => value + 1);
    } catch (err) {
      setError(err?.message || "Unable to remove this saved property.");
    }
  }

  const emptyMessage = useMemo(() => {
    return "Saved properties will appear here when you tap the heart icon on a listing.";
  }, []);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Saved Properties"
        subtitle="Your shortlisted homes live here."
        userName={currentUser?.displayName || userProfile?.fullName || "Client"}
        role={(userProfile?.role || "client").toUpperCase()}
      />

      <View style={styles.topRow}>
        <PrimaryButton
          title="Browse properties"
          onPress={() => router.push("/(client)/properties")}
        />
      </View>

      {loading ? <LoadingSpinner label="Loading saved properties..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load saved properties"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && favorites.length === 0 ? (
        <EmptyState title="No saved properties yet" description={emptyMessage} />
      ) : null}

      {!loading && !error
        ? favorites.map((favorite) => (
            <PropertyCard
              key={favorite.id}
              property={{
                id: favorite.propertyId,
                title: favorite.propertyTitle,
                price: favorite.propertyPrice,
                address: favorite.propertyAddress,
                imageUrl: favorite.propertyImage,
                status: "saved",
              }}
              onView={() =>
                router.push(`/(client)/properties/${favorite.propertyId}`)
              }
              onFavoriteToggle={() => setPendingRemove(favorite)}
              isFavorited
              onSecondaryAction={() => setPendingRemove(favorite)}
              secondaryActionLabel="Remove"
            />
          ))
        : null}

      <ConfirmDialog
        visible={Boolean(pendingRemove)}
        title="Remove saved property?"
        description="This will remove the property from your saved list."
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
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
  topRow: {
    flexDirection: "row",
    gap: 12,
  },
});
