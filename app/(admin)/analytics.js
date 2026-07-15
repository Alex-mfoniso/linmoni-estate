import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import ScreenContainer from "../../components/ScreenContainer";
import AppHeader from "../../components/AppHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import AnalyticsSection from "../../components/AnalyticsSection";
import AnalyticsStatCard from "../../components/AnalyticsStatCard";
import SimpleBarChart from "../../components/SimpleBarChart";
import SimpleDonutChart from "../../components/SimpleDonutChart";
import ActivityItem from "../../components/ActivityItem";
import DateRangeSelector from "../../components/DateRangeSelector";
import { getAdminAnalytics } from "../../services/analyticsService";
import useUnreadNotificationCount from "../../hooks/useUnreadNotificationCount";
import { useRouter } from "expo-router";

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const unreadCount = useUnreadNotificationCount(currentUser?.uid);
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const analytics = await getAdminAnalytics(range);
        if (active) {
          setData(analytics);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load analytics.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [range]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const analytics = await getAdminAnalytics(range);
      setData(analytics);
    } catch (err) {
      setError(err?.message || "Could not refresh analytics.");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !data) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.container}>
      <AppHeader
        title="Analytics"
        subtitle="Track platform performance and usage."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
        notificationCount={unreadCount}
        onNotificationPress={() => router.push("/(admin)/notifications")}
      />

      <DateRangeSelector value={range} onChange={setRange} />

      {error ? <EmptyState title="Analytics unavailable" description={error} /> : null}

      {!error && data ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          <AnalyticsSection title="Overview" subtitle="Platform totals and current health.">
            <View style={styles.statsGrid}>
              {data.stats.map((item) => (
                <AnalyticsStatCard key={item.label} {...item} />
              ))}
            </View>
          </AnalyticsSection>

          <AnalyticsSection title="User mix" subtitle="How accounts are distributed by role and status.">
            <SimpleDonutChart
              data={{
                clients: data.stats.find((item) => item.label === "Clients")?.value || 0,
                realtors: data.stats.find((item) => item.label === "Realtors")?.value || 0,
                staff: data.stats.find((item) => item.label === "Staff")?.value || 0,
                stakeholders: data.stats.find((item) => item.label === "Stakeholders")?.value || 0,
              }}
            />
          </AnalyticsSection>

          <AnalyticsSection title="Pipeline" subtitle="Fresh activity inside the selected date range.">
            <SimpleBarChart
              data={{
                users: data.stats.find((item) => item.label === "New users")?.value || 0,
                properties: data.stats.find((item) => item.label === "New properties")?.value || 0,
                bookings: data.stats.find((item) => item.label === "New bookings")?.value || 0,
              }}
            />
          </AnalyticsSection>

          <AnalyticsSection title="Recent activity" subtitle="Latest changes across the platform.">
            <View style={styles.activityList}>
              {data.recentActivity.map((item) => (
                <ActivityItem key={`${item.type}-${item.id}-${item.createdAt}`} {...item} />
              ))}
            </View>
          </AnalyticsSection>
        </ScrollView>
      ) : null}
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
  scrollContent: {
    gap: 18,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityList: {
    gap: 10,
  },
});
