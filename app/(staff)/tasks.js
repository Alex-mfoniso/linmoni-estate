import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { staffApi } from "../../services/staffApi";

const STATUS_TABS = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "in_progress" },
  { label: "Blocked", value: "blocked" },
  { label: "Done", value: "completed" },
  { label: "Cancelled", value: "cancelled" }
];

const PRIORITIES = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" }
];

export default function StaffTasksListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [activePriority, setActivePriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const filters = {
        status: activeStatus,
        priority: activePriority || undefined,
        search: searchQuery || undefined,
        page: 1,
        limit: 100
      };
      const response = await staffApi.getTasks(filters);
      if (response.success) {
        setTasks(response.data.items || []);
      }
    } catch (err) {
      console.warn("Failed fetching staff tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStatus, activePriority, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks(true);
  }, [fetchTasks]);

  function getPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
      case "critical": return COLORS.error;
      case "high": return COLORS.warning;
      case "medium": return COLORS.info;
      default: return COLORS.mutedText;
    }
  }

  function renderTaskCard({ item }) {
    const priorityColor = getPriorityColor(item.priority);
    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push(`/tasks/${item._id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleGroup}>
            <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {item.priority}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.placeholder} />
        </View>

        <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.mutedText} />
            <Text style={styles.metaText}>
              Due: {new Date(item.dueAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
          {item.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.type}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* 1. Header Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks Workspace</Text>
        <Text style={styles.subtitle}>Manage and complete your daily operational duties.</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.placeholder}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.placeholder} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 2. Status Segments */}
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

      {/* 3. Priority Row filter */}
      <View style={styles.priorityFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PRIORITIES}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.priorityScroll}
          renderItem={({ item }) => {
            const isSelected = activePriority === item.value;
            return (
              <TouchableOpacity
                style={[styles.priorityFilter, isSelected && styles.priorityFilterActive]}
                onPress={() => setActivePriority(item.value)}
              >
                <Text style={[styles.priorityFilterLabel, isSelected && styles.priorityFilterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 4. Tasks Catalog */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No tasks found matching your active filters.</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginBottom: 8
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    padding: 0
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16
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
  priorityFilterContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 8
  },
  priorityScroll: {
    paddingHorizontal: 20,
    gap: 8
  },
  priorityFilter: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  priorityFilterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  priorityFilterLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  priorityFilterLabelActive: {
    color: COLORS.white,
    fontWeight: "600"
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
  taskCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    maxWidth: "70%"
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  taskDesc: {
    fontSize: 12,
    color: COLORS.mutedText,
    lineHeight: 16
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBackground,
    paddingTop: 10
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metaText: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  typeBadge: {
    backgroundColor: COLORS.softPrimary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  typeBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: "center",
    maxWidth: "80%"
  }
});
