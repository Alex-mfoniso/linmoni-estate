import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { staffApi } from "../../services/staffApi";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Done", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" }
];

export default function StaffInspectionsListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [activeStatus, setActiveStatus] = useState("");

  const fetchInspections = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await staffApi.getInspections({
        status: activeStatus || undefined,
        page: 1,
        limit: 100
      });
      if (response.success) {
        setBookings(response.data.items || []);
      }
    } catch (err) {
      console.warn("Failed loading staff inspections:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchInspections();
    }, [fetchInspections])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInspections(true);
  }, [fetchInspections]);

  function renderBookingCard({ item }) {
    const date = new Date(item.scheduledAt);
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${item._id}`)}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
          <Text style={styles.dateBadgeMonth}>
            {date.toLocaleString("default", { month: "short" })}
          </Text>
        </View>

        <View style={styles.detailsGroup}>
          <Text style={styles.propTitle} numberOfLines={1}>
            {item.propertyId?.title || "Property Viewing"}
          </Text>
          <Text style={styles.detailText}>
            Time: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.subText}>Client: {item.userId?.fullName || "Prospective Buyer"}</Text>
          <Text style={styles.subText}>Realtor: {item.realtorId?.fullName || "Assigned Broker"}</Text>
        </View>

        <View style={[styles.statusTag, styles[`status_${item.status}`]]}>
          <Text style={styles.statusTagText}>{item.status?.replace("_", " ")}</Text>
        </View>
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
          <Text style={styles.title}>Inspections Schedule</Text>
          <Text style={styles.subtitle}>Coordinate and monitor operational details of client inspections.</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.tabsScroll}
          renderItem={({ item }) => {
            const isSelected = activeStatus === item.value;
            return (
              <TouchableOpacity
                style={[styles.statusTab, isSelected && styles.statusTabActive]}
                onPress={() => setActiveStatus(item.value)}
              >
                <Text style={[styles.statusTabLabel, isSelected && styles.statusTabLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>No inspections found</Text>
              <Text style={styles.emptySubtitle}>No inspection bookings match your current active status filters.</Text>
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12
  },
  statusTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  statusTabActive: {
    backgroundColor: COLORS.softPrimary
  },
  statusTabLabel: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: "600"
  },
  statusTabLabelActive: {
    color: COLORS.primary,
    fontWeight: "700"
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
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.softPrimary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  dateBadgeDay: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary
  },
  dateBadgeMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase"
  },
  detailsGroup: {
    flex: 1,
    gap: 2
  },
  propTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  detailText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "600"
  },
  subText: {
    fontSize: 10,
    color: COLORS.mutedText
  },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.mutedText,
    textTransform: "uppercase"
  },
  status_confirmed: { backgroundColor: COLORS.successSurface, borderWith: 1, borderColor: COLORS.success },
  status_pending: { backgroundColor: COLORS.warningSurface },
  status_completed: { backgroundColor: COLORS.infoSurface },
  status_cancelled: { backgroundColor: COLORS.errorSurface },
  status_no_show: { backgroundColor: COLORS.surfaceMuted },
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
