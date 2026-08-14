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
  Image,
  Dimensions
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { adminApi } from "../../services/adminApi";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

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
  const pendingApprovals = users?.pendingApprovals || 0;
  const properties = data?.properties || {};
  const operations = data?.operations || {};
  const recentActivity = data?.recentActivity || [];

  // Generate dynamic actionable alerts
  const alerts = [];
  if (properties.pendingReviews > 0) {
    alerts.push({
      id: "pending_reviews",
      type: "warning",
      icon: "business-outline",
      message: `${properties.pendingReviews} properties awaiting manual audit review.`
    });
  }
  if (pendingApprovals > 0) {
    alerts.push({
      id: "pending_approvals",
      type: "info",
      icon: "person-add-outline",
      message: `${pendingApprovals} user registrations pending verification.`
    });
  }
  if (operations.openIssues > 0) {
    alerts.push({
      id: "open_issues",
      type: "danger",
      icon: "alert-circle-outline",
      message: `${operations.openIssues} open platform incidents require resolution.`
    });
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* SaaS Dashboard Top Bar */}
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
            <Text style={styles.welcomeText}>SYSTEM ADMINISTRATOR</Text>
            <Text style={styles.userName}>{userProfile?.fullName || "Admin Console"}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifyButton} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
        }
      >
        {/* Dynamic Alerts Banner Section */}
        {alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.subSectionTitle}>Platform Interventions Required</Text>
            {alerts.map((alert) => {
              const bg = alert.type === "warning" ? "#FFF9C4" : alert.type === "danger" ? "#FFEBEE" : "#E3F2FD";
              const border = alert.type === "warning" ? "#FBC02D" : alert.type === "danger" ? "#E53935" : "#1E88E5";
              const text = alert.type === "warning" ? "#F57F17" : alert.type === "danger" ? "#C62828" : "#0D47A1";
              return (
                <View key={alert.id} style={[styles.alertCard, { backgroundColor: bg, borderColor: border }]}>
                  <Ionicons name={alert.icon} size={18} color={text} style={{ marginRight: 8 }} />
                  <Text style={[styles.alertText, { color: text }]}>{alert.message}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Core Metrics Grid */}
        <Text style={styles.sectionTitle}>Operational Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="people-outline" size={18} color="#1565C0" />
            </View>
            <Text style={styles.metricValue}>{users.total || 0}</Text>
            <Text style={styles.metricLabel}>Total Profiles</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#2E7D32" />
            </View>
            <Text style={styles.metricValue}>{users.active || 0}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="people-circle-outline" size={18} color="#C62828" />
            </View>
            <Text style={styles.metricValue}>{pendingApprovals}</Text>
            <Text style={styles.metricLabel}>Pending Accounts</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="business-outline" size={18} color="#EF6C00" />
            </View>
            <Text style={styles.metricValue}>{properties.total || 0}</Text>
            <Text style={styles.metricLabel}>Total Listings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#EDE7F6" }]}>
              <Ionicons name="calendar-outline" size={18} color="#5E35B1" />
            </View>
            <Text style={styles.metricValue}>{operations.pendingInspections || 0}</Text>
            <Text style={styles.metricLabel}>Inspections</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconFrame, { backgroundColor: "#F3E5F5" }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#8E24AA" />
            </View>
            <Text style={styles.metricValue}>{operations.openIssues || 0}</Text>
            <Text style={styles.metricLabel}>Platform Issues</Text>
          </View>
        </View>

        {/* User Role Distribution Section */}
        <View style={styles.distributionCard}>
          <Text style={styles.cardSectionTitle}>User Allocation by Business Role</Text>
          <View style={styles.roleDistributionRow}>
            {[
              { label: "Clients", count: breakdown.client || 0, color: "#1976D2" },
              { label: "Realtors", count: breakdown.realtor || 0, color: "#388E3C" },
              { label: "Staff", count: breakdown.staff || 0, color: "#F57C00" },
              { label: "Stakeholders", count: breakdown.stakeholder || 0, color: "#7B1FA2" },
              { label: "Admins", count: breakdown.admin || 0, color: "#455A64" }
            ].map((role) => {
              const maxCount = Math.max(
                breakdown.client || 1,
                breakdown.realtor || 1,
                breakdown.staff || 1,
                breakdown.stakeholder || 1,
                breakdown.admin || 1
              );
              const percentageWidth = Math.max(12, (role.count / maxCount) * 100);

              return (
                <View key={role.label} style={styles.distributionItem}>
                  <View style={styles.distributionMeta}>
                    <Text style={styles.distributionLabel}>{role.label}</Text>
                    <Text style={styles.distributionValue}>{role.count}</Text>
                  </View>
                  <View style={styles.distributionTrack}>
                    <View style={[styles.distributionFill, { width: `${percentageWidth}%`, backgroundColor: role.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Audit Timeline Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Administrative Changes</Text>
          <TouchableOpacity onPress={() => router.push("/activity")}>
            <Text style={styles.seeAllText}>Audit Logs</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={28} color={COLORS.mutedText} />
            <Text style={styles.emptyText}>No recent administrative changes recorded.</Text>
          </View>
        ) : (
          recentActivity.map((log) => {
            let actionText = "Modified system configuration";
            let color = COLORS.primary;
            let iconName = "construct-outline";

            if (log.action === "role_changed") {
              actionText = `Transitioned user role to ${log.metadata?.newRole}`;
              color = "#1565C0";
              iconName = "swap-horizontal-outline";
            } else if (log.action === "user_suspended") {
              actionText = "Suspended user profile";
              color = "#C62828";
              iconName = "ban-outline";
            } else if (log.action === "user_restored") {
              actionText = "Restored user profile";
              color = "#2E7D32";
              iconName = "checkmark-circle-outline";
            } else if (log.action === "property_archived") {
              actionText = "Archived property listing";
              color = "#EF6C00";
              iconName = "archive-outline";
            } else if (log.action.endsWith("_created")) {
              const roleTitle = log.action.split("_")[0];
              actionText = `Created new ${roleTitle} account`;
              color = "#7B1FA2";
              iconName = "person-add-outline";
            }

            return (
              <View key={log._id} style={styles.activityCard}>
                <View style={[styles.activityDotContainer, { backgroundColor: color + "15" }]}>
                  <Ionicons name={iconName} size={15} color={color} />
                </View>
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
    fontSize: 13,
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.softPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary
  },
  welcomeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.mutedText,
    letterSpacing: 1,
    fontFamily: "Inter"
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter",
    marginTop: 1
  },
  notifyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 10,
    fontFamily: "Inter",
    letterSpacing: -0.2
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: "Inter",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  alertsContainer: {
    marginBottom: 14
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8
  },
  alertText: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "600",
    flex: 1
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  metricCard: {
    width: width > 600 ? "31%" : "48%",
    backgroundColor: COLORS.cardBackground,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  iconFrame: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 2,
    fontFamily: "Inter"
  },
  distributionCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
    fontFamily: "Inter"
  },
  roleDistributionRow: {
    flexDirection: "column"
  },
  distributionItem: {
    marginBottom: 10
  },
  distributionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  distributionLabel: {
    fontSize: 11,
    color: COLORS.text,
    fontFamily: "Inter"
  },
  distributionValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  distributionTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    overflow: "hidden"
  },
  distributionFill: {
    height: "100%",
    borderRadius: 3
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10
  },
  seeAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: "Inter",
    fontWeight: "600"
  },
  emptyCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 6,
    fontFamily: "Inter"
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  activityDotContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  activityMeta: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 2,
    fontFamily: "Inter"
  },
  activityReason: {
    fontSize: 10,
    fontStyle: "italic",
    color: COLORS.secondary,
    marginTop: 3,
    fontFamily: "Inter"
  }
});
