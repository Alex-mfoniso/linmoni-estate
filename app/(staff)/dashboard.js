import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { staffApi } from "../../services/staffApi";

export default function StaffDashboardScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await staffApi.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.warn("Error fetching staff dashboard stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard(true);
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  const { summary = {}, priorities = [], upcomingInspections = [], pendingProperties = [] } = data || {};

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
        }
      >
        <AppHeader
          title="Home"
          subtitle="Operations & Verification Desk"
          userName={currentUser?.displayName || userProfile?.fullName || "Staff Member"}
          role={(userProfile?.role || "STAFF").toUpperCase()}
        />

        {/* 1. Summary Cards Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/properties")}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.warningSurface }]}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statNumber}>{summary.pendingReviews || 0}</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/bookings")}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.infoSurface }]}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.info} />
            </View>
            <Text style={styles.statNumber}>{summary.todayInspections || 0}</Text>
            <Text style={styles.statLabel}>Inspections Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/tasks")}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.successSurface }]}>
              <Ionicons name="checkbox-outline" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statNumber}>{summary.openTasks || 0}</Text>
            <Text style={styles.statLabel}>Open Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/issues")}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.errorSurface }]}>
              <Ionicons name="bug-outline" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.statNumber}>{summary.openIssues || 0}</Text>
            <Text style={styles.statLabel}>Open Issues</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Priority Timelines / Urgent actions */}
        {priorities.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Urgent Priorities</Text>
            <View style={styles.cardContainer}>
              {priorities.map((item, index) => {
                const isCritical = ["critical", "high"].includes(item.priority?.toLowerCase());
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.priorityItem,
                      index < priorities.length - 1 && styles.borderBottom,
                    ]}
                    onPress={() => {
                      if (item.type === "task") router.push(`/tasks/${item.id}`);
                      if (item.type === "issue") router.push(`/issues/${item.id}`);
                    }}
                  >
                    <View style={styles.priorityLeft}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isCritical ? COLORS.error : COLORS.warning },
                        ]}
                      />
                      <View>
                        <Text style={styles.priorityTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.prioritySub}>{item.detail}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.placeholder} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 3. Quick Actions Shortcuts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Operations</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => router.push("/properties")}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Verify Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
              onPress={() => router.push("/issues")}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Log System Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Pending Listings Queue */}
        {pendingProperties.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Verification Queue</Text>
              <TouchableOpacity onPress={() => router.push("/properties")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContainer}>
              {pendingProperties.map((prop, index) => (
                <TouchableOpacity
                  key={prop._id}
                  style={[
                    styles.queueItem,
                    index < pendingProperties.length - 1 && styles.borderBottom
                  ]}
                  onPress={() => router.push(`/properties/${prop._id}`)}
                >
                  <Image source={{ uri: prop.coverImage?.url }} style={styles.queueImage} />
                  <View style={styles.queueDetails}>
                    <Text style={styles.queuePropTitle} numberOfLines={1}>{prop.title}</Text>
                    <Text style={styles.queuePropSub}>{prop.address?.street}, {prop.address?.city}</Text>
                    <Text style={styles.queuePropRealtor}>Realtor: {prop.realtorId?.fullName || "Broker"}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.placeholder} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 5. Today's Inspections Desk */}
        {upcomingInspections.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inspections Schedule</Text>
              <TouchableOpacity onPress={() => router.push("/bookings")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContainer}>
              {upcomingInspections.map((booking, index) => (
                <TouchableOpacity
                  key={booking._id}
                  style={[
                    styles.queueItem,
                    index < upcomingInspections.length - 1 && styles.borderBottom
                  ]}
                  onPress={() => router.push(`/bookings/${booking._id}`)}
                >
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeDay}>
                      {new Date(booking.scheduledAt).getDate()}
                    </Text>
                    <Text style={styles.dateBadgeMonth}>
                      {new Date(booking.scheduledAt).toLocaleString("default", { month: "short" })}
                    </Text>
                  </View>
                  <View style={styles.queueDetails}>
                    <Text style={styles.queuePropTitle} numberOfLines={1}>
                      {booking.propertyId?.title || "Property Viewing"}
                    </Text>
                    <Text style={styles.queuePropSub}>
                      Time: {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.queuePropRealtor}>
                      Client: {booking.userId?.fullName || "Prospective Buyer"}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status_${booking.status}`]]}>
                    <Text style={styles.statusBadgeText}>{booking.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  sectionContainer: {
    gap: 10
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: "600"
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden"
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  priorityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14
  },
  priorityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text
  },
  prioritySub: {
    fontSize: 12,
    color: COLORS.mutedText
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600"
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12
  },
  queueImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted
  },
  queueDetails: {
    flex: 1,
    gap: 2
  },
  queuePropTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text
  },
  queuePropSub: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  queuePropRealtor: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: "500"
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: COLORS.softPrimary,
    alignItems: "center",
    justifyContent: "center",
    gap: 1
  },
  dateBadgeDay: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary
  },
  dateBadgeMonth: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase"
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.mutedText,
    textTransform: "capitalize"
  },
  status_confirmed: {
    backgroundColor: COLORS.successSurface
  },
  status_pending: {
    backgroundColor: COLORS.warningSurface
  }
});
