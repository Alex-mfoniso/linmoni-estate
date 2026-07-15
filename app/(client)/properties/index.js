import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../../components/AppHeader";
import EmptyState from "../../../components/EmptyState";
import FilterModal from "../../../components/FilterModal";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PropertyCard from "../../../components/PropertyCard";
import ScreenContainer from "../../../components/ScreenContainer";
import SearchBar from "../../../components/SearchBar";
import SortBottomSheet from "../../../components/SortBottomSheet";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "../../../services/favoriteService";
import { getProperties } from "../../../services/propertyService";
import { getPropertyCoverUri } from "../../../utils/propertyMedia";

const DEFAULT_FILTERS = {
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  status: "all",
  propertyType: "all",
};

const PROPERTY_TYPES = [
  "Apartment",
  "Bungalow",
  "Duplex",
  "Land",
  "Penthouse",
  "Studio",
  "Terrace",
  "Townhouse",
];

export default function ClientPropertiesScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [refreshTick, setRefreshTick] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [items, favorites] = await Promise.all([
          getProperties({
            search,
            ...filters,
            sortBy,
          }),
          getUserFavorites(currentUser?.uid),
        ]);

        if (active) {
          setProperties(items);
          setFavoriteIds(new Set(favorites.map((favorite) => favorite.propertyId)));
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load properties.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, search, filters, sortBy, refreshTick]);

  async function handleFavoriteToggle(property) {
    if (!currentUser?.uid || userProfile?.role !== "client") {
      return;
    }

    try {
      const isSaved = favoriteIds.has(property.id);
      if (isSaved) {
        await removeFavorite(currentUser.uid, property.id);
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
      }

      setRefreshTick((value) => value + 1);
    } catch (err) {
      Alert.alert("Favorites", err?.message || "Unable to update favorites.");
    }
  }

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice) count += 1;
    if (filters.maxPrice) count += 1;
    if (filters.bedrooms) count += 1;
    if (filters.bathrooms) count += 1;
    if (filters.status && filters.status !== "all") count += 1;
    if (filters.propertyType && filters.propertyType !== "all") count += 1;
    return count;
  }, [filters]);

  const emptyMessage = useMemo(() => {
    if (search || filterCount > 0) {
      return "Try a different search term or relax the filters.";
    }

    return "Properties will appear here once they are added to the catalog.";
  }, [search, filterCount]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Property Catalog"
        subtitle="Search listings, fine-tune filters, and open a property for details."
        userName={currentUser?.displayName || userProfile?.fullName || "Client"}
        role={(userProfile?.role || "client").toUpperCase()}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search title, address, or property type"
            onClear={() => setSearch("")}
          />
        </View>
        <Pressable onPress={() => setFiltersVisible(true)} style={styles.iconButton}>
          <Ionicons name="options-outline" size={18} color={COLORS.primary} />
          {filterCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable onPress={() => setSortVisible(true)} style={styles.iconButton}>
          <Ionicons name="swap-vertical-outline" size={18} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Sort: {sortBy.replace("-", " ")}</Text>
        <Text style={styles.metaText}>{properties.length} results</Text>
      </View>

      {loading ? <LoadingSpinner label="Loading properties..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load properties"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && properties.length === 0 ? (
        <EmptyState title="No properties found" description={emptyMessage} />
      ) : null}

      {!loading && !error
        ? properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => router.push(`/(client)/properties/${property.id}`)}
              onFavoriteToggle={() => handleFavoriteToggle(property)}
              isFavorited={favoriteIds.has(property.id)}
            />
          ))
        : null}

      <FilterModal
        visible={filtersVisible}
        value={filters}
        onClose={() => setFiltersVisible(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setFiltersVisible(false);
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setFiltersVisible(false);
        }}
        propertyTypes={PROPERTY_TYPES}
      />

      <SortBottomSheet
        visible={sortVisible}
        value={sortBy}
        onClose={() => setSortVisible(false)}
        onSelect={(nextSort) => {
          setSortBy(nextSort);
          setSortVisible(false);
        }}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchWrap: {
    flex: 1,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metaText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
