import { useFocusEffect, useRouter } from "expo-router";
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
import { useAuth } from "../../contexts/AuthContext";

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year", value: "this_year" }
];

export default function StakeholderOverviewScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState("this_month");
  const [stats, setStats] = useState(null);

  const fetchOverview = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await stakeholderApi.getDashboard({ period: activePeriod });
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn("Failed loading stakeholder overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePeriod]);

  useFocusEffect(
    useCallback(() => {
      fetchOverview();
    }, [fetchOverview])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOverview(true);
  }, [fetchOverview]);

  if (loading && !stats) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Compiling Portfolio Analytics...</Text>
      </ScreenContainer>
    );
  }

  const summary = stats?.summary || {};
  const health = stats?.operationalHealth || {};

  return (
    <ScreenContainer style={styles.container}>
      {/* Executive Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {userProfile?.avatar?.url ? (
            <Image source={{ uri: userProfile.avatar.url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userProfile?.fullName?.charAt(0).toUpperCase() || "S"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.welcomeText}>Welcome, Director</Text>
            <Text style={styles.userName}>{userProfile?.fullName || "Stakeholder"}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifyButton} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
        }
      >
        {/* Period selection */}
        <View style={styles.periodRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodsScroll}>
            {PERIODS.map((p) => {
              const isSelected = activePeriod === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.periodBtn, isSelected && styles.periodBtnActive]}
                  onPress={() => setActivePeriod(p.value)}
                >
                  <Text style={[styles.periodLabel, isSelected && styles.periodLabelActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Business Summary Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: COLORS.softPrimary }]}>
              <Ionicons name="business" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.metricValue}>{summary.activeProperties || 0}</Text>
            <Text style={styles.metricLabel}>Active Listings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="people" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.metricValue}>{summary.newClients || 0}</Text>
            <Text style={styles.metricLabel}>New Clients</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="ribbon" size={20} color="#1565C0" />
            </View>
            <Text style={styles.metricValue}>{summary.activeRealtors || 0}</Text>
            <Text style={styles.metricLabel}>Active Realtors</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="calendar" size={20} color="#EF6C00" />
            </View>
            <Text style={styles.metricValue}>{summary.completedInspections || 0}</Text>
            <Text style={styles.metricLabel}>Inspections Completed</Text>
          </View>
        </View>

        {/* Financial Section Boundary */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={18} color={COLORS.mutedText} />
            <Text style={styles.cardSectionTitle}>Financial Performance</Text>
          </View>
          <View style={styles.financialBanner}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.financialText}>
              Financial analytics will become available when transaction data is connected.
            </Text>
          </View>
        </View>

        {/* Operational Health Status */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Operational Health Check</Text>
          <View style={styles.healthRow}>
            <View style={styles.healthCol}>
              <Text style={styles.healthValue}>{health.pendingReviews || 0}</Text>
              <Text style={styles.healthLabel}>Pending Reviews</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthCol}>
              <Text style={styles.healthValue}>{health.openIssues || 0}</Text>
              <Text style={styles.healthLabel}>Open Incidents</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthCol}>
              <Text style={styles.healthValue}>{health.upcomingInspections || 0}</Text>
              <Text style={styles.healthLabel}>Upcoming Slots</Text>
            </View>
          </View>
        </View>

        {/* Top Performing Properties */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Top Portfolio Properties</Text>
          <TouchableOpacity onPress={() => router.push("/analytics")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {stats?.topProperties?.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Portfolio properties will appear here.</Text>
          </View>
        ) : (
          stats?.topProperties?.map((p) => (
            <View key={p._id} style={styles.propertyListItem}>
              {p.coverImage?.url ? (
                <Image source={{ uri: p.coverImage.url }} style={styles.propertyImg} />
              ) : (
                <View style={styles.propertyImgPlaceholder}>
                  <Ionicons name="image-outline" size={20} color={COLORS.placeholder} />
                </View>
              )}
              <View style={styles.propertyMeta}>
                <Text style={styles.propertyTitle} numberOfLines={1}>{p.title}</Text>
                <Text style={styles.propertyPrice}>NGN {p.price?.toLocaleString()}</Text>
                <Text style={styles.propertyLocation}>{p.city}, {p.state}</Text>
              </View>
            </View>
          ))
        )}

        {/* Realtor broker networks */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Brokerage Network Status</Text>
        </View>

        {stats?.realtorPerformance?.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Realtor network logs will appear here.</Text>
          </View>
        ) : (
          <View style={styles.realtorScroll}>
            {stats?.realtorPerformance?.map((r) => (
              <View key={r._id} style={styles.realtorItem}>
                <Text style={styles.realtorName} numberOfLines={1}>{r.fullName}</Text>
                <Text style={styles.realtorAgency} numberOfLines={1}>{r.agency || "Independent"}</Text>
                <View style={styles.realtorPills}>
                  <View style={styles.realtorPill}>
                    <Text style={styles.realtorPillText}>{r.activeListingsCount} listings</Text>
                  </View>
                  <View style={[styles.realtorPill, { backgroundColor: COLORS.successSurface }]}>
                    <Text style={[styles.realtorPillText, { color: COLORS.success }]}>{r.completedInspectionsCount} viewings</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: "center",
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.softPrimary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary
  },
  welcomeText: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text
  },
  notifyButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border
  },
  scrollContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 40
  },
  periodRow: {
    marginBottom: 4
  },
  periodsScroll: {
    gap: 8
  },
  periodBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  periodLabel: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  periodLabelActive: {
    color: COLORS.white,
    fontWeight: "600"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    gap: 6
  },
  iconFrame: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 10
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  financialBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  financialText: {
    fontSize: 11,
    color: COLORS.mutedText,
    lineHeight: 16,
    flex: 1,
    fontWeight: "500"
  },
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6
  },
  healthCol: {
    flex: 1,
    alignItems: "center"
  },
  healthValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary
  },
  healthLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: "600",
    marginTop: 2
  },
  healthDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary
  },
  emptyWrap: {
    paddingVertical: 20,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.placeholder
  },
  propertyListItem: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    gap: 12
  },
  propertyImg: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  propertyImgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center"
  },
  propertyMeta: {
    flex: 1,
    justifyContent: "center",
    gap: 2
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  propertyPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  propertyLocation: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  realtorScroll: {
    gap: 10
  },
  realtorItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    gap: 4
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
  realtorPills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  realtorPill: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  realtorPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.mutedText
  }
});
