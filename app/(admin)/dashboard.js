import { useFocusEffect, useRouter } from "expo-router";
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
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { adminApi } from "../../services/adminApi";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminOverviewScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchOverview = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await adminApi.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.warn("Failed loading admin dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOverview();
    }, [fetchOverview])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOverview(true);
  }, [fetchOverview]);

  if (loading && !data) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Synthesizing Administrative Console...</Text>
      </ScreenContainer>
    );
  }

  const users = data?.users || {};
  const breakdown = users?.breakdown || {};
  const properties = data?.properties || {};
  const operations = data?.operations || {};
  const security = data?.security || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <ScreenContainer style={styles.container}>
      {/* Executive Admin Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {userProfile?.avatar?.url ? (
            <Image source={{ uri: userProfile.avatar.url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userProfile?.fullName?.charAt(0).toUpperCase() || "A"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.welcomeText}>System Administrator</Text>
            <Text style={styles.userName}>{userProfile?.fullName || "Admin Console"}</Text>
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
        {/* Section 1: Platform Overview Cards */}
        <Text style={styles.sectionTitle}>Platform Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="people-outline" size={20} color="#1565C0" />
            </View>
            <Text style={styles.metricValue}>{users.total || 0}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.metricValue}>{users.active || 0}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="business-outline" size={20} color="#EF6C00" />
            </View>
            <Text style={styles.metricValue}>{properties.total || 0}</Text>
            <Text style={styles.metricLabel}>Total Properties</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: COLORS.softPrimary }]}>
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.metricValue}>{properties.activeListings || 0}</Text>
            <Text style={styles.metricLabel}>Active Listings</Text>
          </View>
        </View>

        {/* Section 2: User Breakdown Roll-out */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>User Distribution by Role</Text>
          <View style={styles.roleRow}>
            <View style={styles.roleCol}>
              <Text style={styles.roleValue}>{breakdown.client || 0}</Text>
              <Text style={styles.roleLabel}>Clients</Text>
            </View>
            <View style={styles.roleDivider} />
            <View style={styles.roleCol}>
              <Text style={styles.roleValue}>{breakdown.realtor || 0}</Text>
              <Text style={styles.roleLabel}>Realtors</Text>
            </View>
            <View style={styles.roleDivider} />
            <View style={styles.roleCol}>
              <Text style={styles.roleValue}>{breakdown.staff || 0}</Text>
              <Text style={styles.roleLabel}>Staff</Text>
            </View>
            <View style={styles.roleDivider} />
            <View style={styles.roleCol}>
              <Text style={styles.roleValue}>{breakdown.stakeholder || 0}</Text>
              <Text style={styles.roleLabel}>Investors</Text>
            </View>
            <View style={styles.roleDivider} />
            <View style={styles.roleCol}>
              <Text style={styles.roleValue}>{breakdown.admin || 0}</Text>
              <Text style={styles.roleLabel}>Admins</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Operational Health Status Indicator */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Administrative Health Diagnostics</Text>
          <View style={styles.healthRow}>
            <View style={styles.healthItem}>
              <Text style={[styles.healthValue, operations.pendingPropertyReviews > 0 && { color: COLORS.secondary }]}>
                {operations.pendingPropertyReviews || 0}
              </Text>
              <Text style={styles.healthLabel}>Review Queue</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={[styles.healthValue, operations.openIssues > 0 && { color: "#C62828" }]}>
                {operations.openIssues || 0}
              </Text>
              <Text style={styles.healthLabel}>Open Incidents</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthValue}>{operations.pendingInspections || 0}</Text>
              <Text style={styles.healthLabel}>Inspections Slots</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Recent Security and Configuration Log Timeline */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Administrative Changes</Text>
          <TouchableOpacity onPress={() => router.push("/activity")}>
            <Text style={styles.seeAllText}>Audit Logs</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={32} color={COLORS.mutedText} />
            <Text style={styles.emptyText}>No recent administrative changes recorded.</Text>
          </View>
        ) : (
          recentActivity.map((log) => {
            let actionText = "Modified system configuration";
            let color = COLORS.primary;
            if (log.action === "role_changed") {
              actionText = `Transitioned user role to ${log.metadata?.newRole}`;
              color = "#1565C0";
            } else if (log.action === "user_suspended") {
              actionText = "Suspended user profile";
              color = "#C62828";
            } else if (log.action === "user_restored") {
              actionText = "Restored user profile";
              color = "#2E7D32";
            } else if (log.action === "property_archived") {
              actionText = "Archived property listing";
              color = "#EF6C00";
            }

            return (
              <View key={log._id} style={styles.activityCard}>
                <View style={[styles.activityDot, { backgroundColor: color }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{actionText}</Text>
                  <Text style={styles.activityMeta}>
                    By {log.actorUserId?.fullName || "System Admin"} • {new Date(log.createdAt).toLocaleDateString()}
                  </Text>
                  {log.metadata?.reason && (
                    <Text style={styles.activityReason}>Reason: "{log.metadata.reason}"</Text>
                  )}
                </View>
              </View>
            );
          })
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.softPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  notifyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 12,
    fontFamily: "Inter"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  metricCard: {
    width: "48%",
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  iconFrame: {
    width: 36,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 4,
    fontFamily: "Inter"
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: "Inter"
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  roleCol: {
    alignItems: "center",
    flex: 1
  },
  roleValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  roleLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 4,
    fontFamily: "Inter"
  },
  roleDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider
  },
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  healthItem: {
    alignItems: "center"
  },
  healthValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  healthLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 4,
    fontFamily: "Inter"
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: "Inter"
  },
  emptyCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 8,
    fontFamily: "Inter"
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  activityMeta: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 3,
    fontFamily: "Inter"
  },
  activityReason: {
    fontSize: 11,
    fontStyle: "italic",
    color: COLORS.secondary,
    marginTop: 4,
    fontFamily: "Inter"
  }
});
