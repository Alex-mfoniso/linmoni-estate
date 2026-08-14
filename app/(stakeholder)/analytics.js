import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { stakeholderApi } from "../../services/stakeholderApi";

const TABS = [
  { label: "Portfolio", value: "portfolio" },
  { label: "Brokers", value: "brokers" },
  { label: "Operations", value: "operations" }
];

export default function StakeholderAnalyticsScreen() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [realtorData, setRealtorData] = useState([]);
  const [staffData, setStaffData] = useState(null);
  const [brokerSort, setBrokerSort] = useState("listings"); // listings or inspections

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      if (activeTab === "portfolio") {
        const response = await stakeholderApi.getPropertyAnalytics();
        if (response.success) {
          setPropertyData(response.data);
        }
      } else if (activeTab === "brokers") {
        const response = await stakeholderApi.getRealtorAnalytics({ sort: brokerSort });
        if (response.success) {
          setRealtorData(response.data.items || []);
        }
      } else if (activeTab === "operations") {
        const response = await stakeholderApi.getStaffAnalytics();
        if (response.success) {
          setStaffData(response.data);
        }
      }
    } catch (err) {
      console.warn("Failed loading analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, brokerSort]);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Intelligence Desk</Text>
        <Text style={styles.subtitle}>Consolidated records, listings inventory, and staff velocities.</Text>
      </View>

      {/* Segment Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const isSel = activeTab === t.value;
          return (
            <TouchableOpacity
              key={t.value}
              style={[styles.tabBtn, isSel && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.value)}
            >
              <Text style={[styles.tabLabel, isSel && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Content Area */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
        >
          {activeTab === "portfolio" && (
            <View style={styles.section}>
              {/* Properties distribution indicators */}
              <Text style={styles.sectionTitle}>Listings Inventory Mix</Text>
              <View style={styles.mixGrid}>
                {propertyData?.statusBreakdown && Object.entries(propertyData.statusBreakdown).map(([status, count]) => (
                  <View key={status} style={styles.mixCard}>
                    <Text style={styles.mixCount}>{count}</Text>
                    <Text style={styles.mixLabel}>{status}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Portfolio File Logs</Text>
              {propertyData?.items?.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No registered portfolio property records.</Text>
                </View>
              ) : (
                propertyData?.items?.map((p) => (
                  <View key={p._id} style={styles.propertyCard}>
                    <View style={styles.propertyHead}>
                      <Text style={styles.propertyTitle}>{p.title}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{p.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.propertyTypeLabel}>{p.propertyType} • {p.listingType}</Text>
                    <Text style={styles.propertyPrice}>NGN {p.price?.toLocaleString()}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="person-circle" size={14} color={COLORS.mutedText} />
                      <Text style={styles.metaText}>Realtor: {p.realtorId?.fullName || "Staff Admin"}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "brokers" && (
            <View style={styles.section}>
              {/* Sorting filters */}
              <View style={styles.sortRow}>
                <Text style={styles.sortTitle}>Sort Performance:</Text>
                <View style={styles.sortBtns}>
                  <TouchableOpacity
                    style={[styles.sortBtn, brokerSort === "listings" && styles.sortBtnActive]}
                    onPress={() => setBrokerSort("listings")}
                  >
                    <Text style={[styles.sortLabel, brokerSort === "listings" && styles.sortLabelActive]}>Listings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, brokerSort === "inspections" && styles.sortBtnActive]}
                    onPress={() => setBrokerSort("inspections")}
                  >
                    <Text style={[styles.sortLabel, brokerSort === "inspections" && styles.sortLabelActive]}>Inspections</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {realtorData.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No active brokers on directory logs.</Text>
                </View>
              ) : (
                realtorData.map((r) => (
                  <View key={r._id} style={styles.realtorCard}>
                    <View style={styles.realtorRow}>
                      <Ionicons name="ribbon" size={20} color={COLORS.secondary} />
                      <View>
                        <Text style={styles.realtorName}>{r.fullName}</Text>
                        <Text style={styles.realtorAgency}>{r.agency || "Independent Agency"}</Text>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.realtorMetrics}>
                      <View style={styles.realtorMetric}>
                        <Text style={styles.metricVal}>{r.activeListings || 0}</Text>
                        <Text style={styles.metricLbl}>Active Listings</Text>
                      </View>
                      <View style={styles.realtorMetric}>
                        <Text style={styles.metricVal}>{r.totalListings || 0}</Text>
                        <Text style={styles.metricLbl}>Total Catalog</Text>
                      </View>
                      <View style={styles.realtorMetric}>
                        <Text style={styles.metricVal}>{r.completedInspections || 0}</Text>
                        <Text style={styles.metricLbl}>Viewings Done</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "operations" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operational Velocities</Text>
              <View style={styles.opCard}>
                <View style={styles.opItem}>
                  <View style={styles.opLeft}>
                    <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
                    <View>
                      <Text style={styles.opLabel}>Properties Reviews Completed</Text>
                      <Text style={styles.opDesc}>Assurance quality checks processed by staff auditors.</Text>
                    </View>
                  </View>
                  <Text style={styles.opValue}>{staffData?.reviewsProcessed || 0}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.opItem}>
                  <View style={styles.opLeft}>
                    <Ionicons name="bug" size={24} color={COLORS.error} />
                    <View>
                      <Text style={styles.opLabel}>Resolved Application Issues</Text>
                      <Text style={styles.opDesc}>Anomalies logs marked fully closed by system experts.</Text>
                    </View>
                  </View>
                  <Text style={styles.opValue}>{staffData?.issuesResolved || 0}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.opItem}>
                  <View style={styles.opLeft}>
                    <Ionicons name="people-circle" size={24} color={COLORS.primary} />
                    <View>
                      <Text style={styles.opLabel}>Operational Staff Capacity</Text>
                      <Text style={styles.opDesc}>Active officers performing backend maintenance duties.</Text>
                    </View>
                  </View>
                  <Text style={styles.opValue}>{staffData?.activeStaffCount || 0}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
    lineHeight: 16
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary
  },
  tabLabel: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: "600"
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: "800"
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40
  },
  section: {
    gap: 14
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  mixGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  mixCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    alignItems: "center"
  },
  mixCount: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary
  },
  mixLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.mutedText,
    textTransform: "capitalize",
    marginTop: 2
  },
  propertyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 6
  },
  propertyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1
  },
  statusBadge: {
    backgroundColor: COLORS.softPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    color: COLORS.primary
  },
  propertyTypeLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2
  },
  metaText: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  sortTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text
  },
  sortBtns: {
    flexDirection: "row",
    gap: 6
  },
  sortBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  sortBtnActive: {
    backgroundColor: COLORS.softPrimary,
    borderColor: COLORS.primary
  },
  sortLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  sortLabelActive: {
    color: COLORS.primary,
    fontWeight: "700"
  },
  realtorCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    gap: 10
  },
  realtorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  realtorName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  realtorAgency: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border
  },
  realtorMetrics: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  realtorMetric: {
    flex: 1,
    alignItems: "center"
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary
  },
  metricLbl: {
    fontSize: 9,
    color: COLORS.mutedText,
    fontWeight: "600",
    marginTop: 1
  },
  opCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    gap: 12
  },
  opItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  opLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  opLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  opDesc: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 1,
    lineHeight: 14
  },
  opValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary
  },
  emptyWrap: {
    paddingVertical: 30,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.placeholder
  }
});
