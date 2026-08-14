import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../../components/AppHeader";
import EmptyState from "../../../components/EmptyState";
import FilterModal from "../../../components/FilterModal";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PropertyCard from "../../../components/PropertyCard";
import SearchBar from "../../../components/SearchBar";
import SortBottomSheet from "../../../components/SortBottomSheet";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { favouriteApi } from "../../../services/favouriteApi";
import { propertyApi } from "../../../services/propertyApi";

const DEFAULT_FILTERS = { minPrice: "", maxPrice: "", bedrooms: "", bathrooms: "", status: "all", propertyType: "all" };
const PROPERTY_TYPES = ["Apartment", "Bungalow", "Duplex", "Detached", "Land", "Terrace", "Commercial", "Office", "Shop", "Warehouse"];
const SORT_MAP = { newest: "newest", "price-asc": "price_low_to_high", "price-desc": "price_high_to_low", relevant: "most_relevant" };
const CLIENT_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Lowest price", value: "price-asc" },
  { label: "Highest price", value: "price-desc" },
  { label: "Most relevant", value: "relevant" },
];

export default function ClientPropertiesScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  function query(page) {
    return {
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minBedrooms: filters.bedrooms || undefined,
      minBathrooms: filters.bathrooms || undefined,
      propertyType: filters.propertyType !== "all" ? filters.propertyType.toLowerCase() : undefined,
      sort: SORT_MAP[sortBy] || "newest",
    };
  }

  async function load(page = 1, mode = "initial") {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    if (mode === "initial") setLoading(true);
    if (mode === "more") setLoadingMore(true);
    if (mode === "refresh") setRefreshing(true);
    setError("");
    try {
      const [result, favourites] = await Promise.all([
        propertyApi.list(query(page), { signal: controller.signal }),
        page === 1 ? favouriteApi.list({ page: 1, limit: 50 }, { signal: controller.signal }) : Promise.resolve(null),
      ]);
      setProperties((current) => page === 1 ? result.items : [...current, ...result.items]);
      setPagination(result.pagination);
      if (favourites) setFavoriteIds(new Set(favourites.items.map((item) => item.property.id)));
    } catch (err) {
      if (err?.code !== "REQUEST_CANCELLED") setError(err?.message || "Could not load properties.");
    } finally {
      if (requestRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void load();
    return () => requestRef.current?.abort();
  }, [debouncedSearch, filters, sortBy]);

  async function handleFavoriteToggle(property) {
    const wasSaved = favoriteIds.has(property.id);
    setFavoriteIds((current) => {
      const next = new Set(current);
      wasSaved ? next.delete(property.id) : next.add(property.id);
      return next;
    });
    try {
      await (wasSaved ? favouriteApi.remove(property.id) : favouriteApi.add(property.id));
    } catch (err) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        wasSaved ? next.add(property.id) : next.delete(property.id);
        return next;
      });
      Alert.alert("Saved properties", err?.message || "Unable to update this property.");
    }
  }

  const filterCount = useMemo(() => ["minPrice", "maxPrice", "bedrooms", "bathrooms"].filter((key) => filters[key]).length + (filters.propertyType !== "all" ? 1 : 0), [filters]);
  const header = (
    <View style={styles.header}>
      <AppHeader title="Find your next address" subtitle="Explore verified LINPAL listings and book an inspection." userName={currentUser?.displayName || userProfile?.fullName || "Client"} role="CLIENT" />
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}><SearchBar value={search} onChangeText={setSearch} placeholder="Search homes and locations" onClear={() => setSearch("")} /></View>
        <Pressable onPress={() => setFiltersVisible(true)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Open property filters">
          <Ionicons name="options-outline" size={19} color={COLORS.primary} />
          {filterCount ? <View style={styles.badge}><Text style={styles.badgeText}>{filterCount}</Text></View> : null}
        </Pressable>
        <Pressable onPress={() => setSortVisible(true)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Sort properties"><Ionicons name="swap-vertical-outline" size={19} color={COLORS.primary} /></Pressable>
      </View>
      <View style={styles.metaRow}><Text style={styles.metaText}>{pagination?.totalItems ?? properties.length} properties</Text><Text style={styles.metaText}>Sorted by {sortBy.replace("-", " ")}</Text></View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} onView={() => router.push(`/(client)/properties/${item.id}`)} onFavoriteToggle={() => handleFavoriteToggle(item)} isFavorited={favoriteIds.has(item.id)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={!loading ? <EmptyState title={error ? "We could not load properties" : "No properties found"} description={error || "Try a different search or relax the filters."} actionLabel={error ? "Try again" : undefined} onAction={error ? () => load() : undefined} /> : null}
        ListFooterComponent={loading ? <LoadingSpinner label="Loading properties..." /> : loadingMore ? <LoadingSpinner label="Loading more..." /> : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, "refresh")} tintColor={COLORS.primary} />}
        onEndReached={() => pagination?.hasNextPage && !loadingMore && void load(pagination.page + 1, "more")}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
      />
      <FilterModal visible={filtersVisible} value={filters} onClose={() => setFiltersVisible(false)} onApply={(value) => { setFilters(value); setFiltersVisible(false); }} onReset={() => { setFilters(DEFAULT_FILTERS); setFiltersVisible(false); }} propertyTypes={PROPERTY_TYPES} showStatus={false} />
      <SortBottomSheet visible={sortVisible} value={sortBy} options={CLIENT_SORT_OPTIONS} onClose={() => setSortVisible(false)} onSelect={(value) => { setSortBy(value); setSortVisible(false); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, width: "100%", maxWidth: 920, alignSelf: "center", flexGrow: 1 },
  header: { gap: 14, marginBottom: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchWrap: { flex: 1 },
  iconButton: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  badge: { position: "absolute", top: 5, right: 5, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: "900" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  metaText: { color: COLORS.mutedText, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  separator: { height: 14 },
});
