import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { adminApi } from "../../services/adminApi";

const AUDIT_FILTERS = [
  { id: "", label: "All Actions" },
  { id: "role_changed", label: "Roles Only" },
  { id: "user_suspended", label: "Suspensions" },
  { id: "property_archived", label: "Archived List" },
  { id: "platform_setting_changed", label: "Settings" }
];

export default function AdminActivityLogsScreen() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await adminApi.getAuditLogs({
        search,
        action: actionFilter,
        page: currentPage,
        limit: 15
      });

      if (res.success) {
        if (reset) {
          setLogs(res.data);
          setPage(2);
        } else {
          setLogs(prev => [...prev, ...res.data]);
          setPage(prev => prev + 1);
        }
        setHasMore(res.data.length === 15);
      }
    } catch (err) {
      console.warn("Failed fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page, loading]);

  useFocusEffect(
    useCallback(() => {
      fetchLogs(true);
    }, [actionFilter])
  );

  const handleSearchSubmit = () => {
    fetchLogs(true);
  };

  const toggleExpand = (logId) => {
    setExpandedLogId(prev => (prev === logId ? null : logId));
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Search and Filters Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.mutedText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search audit actions or targets ID..."
            placeholderTextColor={COLORS.mutedText}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {AUDIT_FILTERS.map(f => {
            const isSelected = actionFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => {
                  setActionFilter(f.id);
                  setPage(1);
                  setLogs([]);
                }}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Audit Logs FlatList */}
      <FlatList
        data={logs}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => {
          const isExpanded = expandedLogId === item._id;
          let dotColor = COLORS.primary;
          let actionLabel = "System Event";

          if (item.action === "role_changed") {
            dotColor = "#1565C0";
            actionLabel = "Role Transition";
          } else if (item.action === "user_suspended") {
            dotColor = "#C62828";
            actionLabel = "Account Blocked";
          } else if (item.action === "user_restored") {
            dotColor = "#2E7D32";
            actionLabel = "Account Restored";
          } else if (item.action === "platform_setting_changed") {
            dotColor = "#6A1B9A";
            actionLabel = "Settings Tweaked";
          } else if (item.action === "property_archived") {
            dotColor = "#EF6C00";
            actionLabel = "Listing Archived";
          }

          return (
            <View style={styles.logRow}>
              {/* Timeline layout vertical bar */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                {index < logs.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <TouchableOpacity style={styles.logCard} onPress={() => toggleExpand(item._id)}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.actionTag, { color: dotColor }]}>{actionLabel.toUpperCase()}</Text>
                  <Text style={styles.logTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <Text style={styles.logActionTitle}>{item.action.replace(/_/g, " ").toUpperCase()}</Text>
                <Text style={styles.logActor}>
                  By {item.actorUserId?.fullName || "System Admin"} ({item.actorUserId?.role || "SYSTEM"})
                </Text>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Target Type:</Text>
                      <Text style={styles.metaVal}>{item.targetType.toUpperCase()}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Target Reference ID:</Text>
                      <Text style={styles.metaVal}>{item.targetId || "Global Setting"}</Text>
                    </View>
                    {item.ipAddress && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>IP Address:</Text>
                        <Text style={styles.metaVal}>{item.ipAddress}</Text>
                      </View>
                    )}
                    {item.metadata && (
                      <View style={styles.metaBlock}>
                        <Text style={styles.metaLabel}>Auditing Context / Metadata:</Text>
                        <Text style={styles.metaCode}>{JSON.stringify(item.metadata, null, 2)}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.expandRow}>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={COLORS.mutedText} />
                  <Text style={styles.expandText}>{isExpanded ? "Hide specs" : "Inspect spec details"}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        onEndReached={() => {
          if (hasMore && !loading) fetchLogs();
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={40} color={COLORS.mutedText} />
              <Text style={styles.emptyText}>No secure logs matched the query.</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter"
  },
  filtersRow: {
    paddingVertical: 2
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterText: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  filterTextActive: {
    color: "#fff"
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24
  },
  logRow: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  timelineLeft: {
    width: 24,
    alignItems: "center",
    position: "relative"
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 18,
    zIndex: 2
  },
  timelineLine: {
    position: "absolute",
    top: 24,
    bottom: -18,
    width: 2,
    backgroundColor: COLORS.divider,
    zIndex: 1
  },
  logCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actionTag: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Inter"
  },
  logTime: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  logActionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 6,
    fontFamily: "Inter"
  },
  logActor: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 4,
    fontFamily: "Inter"
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 8
  },
  expandText: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginLeft: 6,
    fontFamily: "Inter"
  },
  expandedContent: {
    marginTop: 12,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  metaVal: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  metaBlock: {
    marginTop: 8
  },
  metaCode: {
    fontSize: 9,
    color: COLORS.secondary,
    fontFamily: "Inter",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 4,
    marginTop: 4
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 8,
    fontFamily: "Inter"
  }
});
