import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { staffApi } from "../../services/staffApi";

export default function StaffPropertiesReviewListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPendingProperties = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const filters = {
        search: searchQuery || undefined,
        page: 1,
        limit: 100
      };
      const response = await staffApi.getPendingProperties(filters);
      if (response.success) {
        setProperties(response.data.items || []);
      }
    } catch (err) {
      console.warn("Failed loading pending properties:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchPendingProperties();
    }, [fetchPendingProperties])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingProperties(true);
  }, [fetchPendingProperties]);

  function formatPrice(amount) {
    if (!amount) return "₦0";
    return "₦" + amount.toLocaleString("en-US");
  }

  function renderPropertyCard({ item }) {
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => router.push(`/properties/${item._id}`)}
      >
        <Image source={{ uri: item.coverImage?.url }} style={styles.coverImage} />
        <View style={styles.detailsGroup}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
          <Text style={styles.propTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address?.street}, {item.address?.city}
          </Text>
          <View style={styles.metaDivider} />
          <View style={styles.realtorRow}>
            <Ionicons name="person-circle-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.realtorText} numberOfLines={1}>
              {item.realtorId?.fullName || "Broker"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.placeholder} />
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Listing Verifications</Text>
          <Text style={styles.subtitle}>Review, approve, or request corrections on Realtor submissions.</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pending addresses, title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.placeholder}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.placeholder} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>Queue is empty</Text>
              <Text style={styles.emptySubtitle}>All submitted property listings have been successfully verified!</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12
  },
  backIconButton: {
    width: 36,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  headerTitles: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    lineHeight: 15
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.background
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    padding: 0
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  listScroll: {
    padding: 20,
    gap: 12,
    paddingBottom: 40
  },
  propertyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    gap: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  coverImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted
  },
  detailsGroup: {
    flex: 1,
    gap: 2
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary
  },
  propTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  addressText: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.inputBackground,
    marginVertical: 2
  },
  realtorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  realtorText: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: "center",
    maxWidth: "80%"
  }
});
