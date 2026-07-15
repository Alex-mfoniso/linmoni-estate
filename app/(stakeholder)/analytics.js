import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
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
import { getStakeholderAnalytics } from "../../services/analyticsService";
import useUnreadNotificationCount from "../../hooks/useUnreadNotificationCount";

export default function StakeholderAnalyticsScreen() {
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
        const analytics = await getStakeholderAnalytics(range);
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
      const analytics = await getStakeholderAnalytics(range);
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
        subtitle="Portfolio metrics and reporting overview."
        userName={currentUser?.displayName || userProfile?.fullName || "Stakeholder"}
        role={(userProfile?.role || ROLES.STAKEHOLDER).toUpperCase()}
        notificationCount={unreadCount}
        onNotificationPress={() => router.push("/(stakeholder)/notifications")}
      />

      <DateRangeSelector value={range} onChange={setRange} />

      {error ? <EmptyState title="Analytics unavailable" description={error} /> : null}

      {!error && data ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          <AnalyticsSection title="Overview" subtitle="Portfolio totals and status mix.">
            <View style={styles.statsGrid}>
              {data.stats.map((item) => (
                <AnalyticsStatCard key={item.label} {...item} />
              ))}
            </View>
          </AnalyticsSection>

          <AnalyticsSection title="Property status" subtitle="Available, reserved, and sold inventory.">
            <SimpleDonutChart data={data.propertyStatusDistribution} />
          </AnalyticsSection>

          <AnalyticsSection title="Booking status" subtitle="Current inspection pipeline.">
            <SimpleBarChart data={data.bookingStatusDistribution} />
          </AnalyticsSection>

          <AnalyticsSection title="Recent activity" subtitle="Latest property updates.">
            <View style={styles.activityList}>
              {data.recentActivity.map((item) => (
                <ActivityItem key={`${item.id}-${item.createdAt}`} {...item} />
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
