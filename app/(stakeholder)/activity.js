import { useFocusEffect, useRouter } from "expo-router";
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
import { stakeholderApi } from "../../services/stakeholderApi";

const ACTION_FILTERS = [
  { label: "All Events", value: "" },
  { label: "Verifications", value: "property_verified" },
  { label: "Rejected Logs", value: "property_changes_requested" },
  { label: "Issues Resolved", value: "issue_resolved" },
  { label: "Inspection Alerts", value: "inspection_updated" }
];

export default function StakeholderActivityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivity = useCallback(async (isRefresh = false, pageNum = 1) => {
    if (!isRefresh && pageNum === 1) setLoading(true);
    try {
      const response = await stakeholderApi.getActivityLogs({
        action: activeFilter || undefined,
        page: pageNum,
        limit: 20
      });
      if (response.success) {
        const items = response.data.items || [];
        if (pageNum === 1) {
          setLogs(items);
        } else {
          setLogs((prev) => [...prev, ...items]);
        }
        setHasMore(items.length === 20);
      }
    } catch (err) {
      console.warn("Failed loading activity logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchActivity(true, 1);
    }, [activeFilter])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchActivity(true, 1);
  }, [fetchActivity]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivity(false, nextPage);
  }, [hasMore, loading, refreshing, page, fetchActivity]);

  function getActionStyle(act) {
    switch (act) {
      case "property_verified":
        return { color: COLORS.success, icon: "checkmark-circle", bg: COLORS.successSurface };
      case "property_changes_requested":
        return { color: COLORS.error, icon: "alert-circle", bg: "#FCE4EC" };
      case "issue_resolved":
        return { color: "#1565C0", icon: "bug-outline", bg: "#E3F2FD" };
      case "inspection_updated":
        return { color: "#EF6C00", icon: "calendar-outline", bg: "#FFF3E0" };
      default:
        return { color: COLORS.mutedText, icon: "finger-print", bg: COLORS.inputBackground };
    }
  }

  function renderLogItem({ item }) {
    const style = getActionStyle(item.action);
    const dateStr = new Date(item.createdAt).toLocaleString();
    return (
      <View style={styles.logCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconFrame, { backgroundColor: style.bg }]}>
            <Ionicons name={style.icon} size={16} color={style.color} />
          </View>
          <View style={styles.headMeta}>
            <Text style={styles.logTitle}>{item.action?.replace(/_/g, " ").toUpperCase()}</Text>
            <Text style={styles.logTime}>{dateStr}</Text>
          </View>
        </View>
        <Text style={styles.logActor}>Actor: {item.actorUserId?.fullName || "System Officer"}</Text>
        <Text style={styles.logDetails} numberOfLines={2}>
          {item.metadata?.reason || item.metadata?.title || `Target ID: ${item.targetId || "Unspecified"}`}
        </Text>
      </View>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Corporate Audits</Text>
        <Text style={styles.subtitle}>Audit logs tracking transactions, staff compliance, and catalog updates.</Text>
      </View>

      {/* Segment filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {ACTION_FILTERS.map((f) => {
            const isSel = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterBtn, isSel && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f.value)}
              >
                <Text style={[styles.filterText, isSel && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lists feed */}
      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>No business events found</Text>
              <Text style={styles.emptySubtitle}>Events will log here automatically as team officers and brokers interact with the platform.</Text>
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
  filterBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8
  },
  filterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterText: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "600"
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  listContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 40
  },
  logCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconFrame: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  headMeta: {
    flex: 1,
    gap: 1
  },
  logTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.3
  },
  logTime: {
    fontSize: 10,
    color: COLORS.placeholder
  },
  logActor: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "600"
  },
  logDetails: {
    fontSize: 12,
    color: COLORS.mutedText,
    lineHeight: 16,
    fontStyle: "italic",
    backgroundColor: COLORS.inputBackground,
    padding: 8,
    borderRadius: 6
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 8
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 16
  }
});
