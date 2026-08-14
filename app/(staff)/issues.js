import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
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

const SEVERITIES = [
  { label: "All Severities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" }
];

const STATUS_TABS = [
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Waiting", value: "waiting" },
  { label: "Resolved", value: "resolved" }
];

export default function StaffIssuesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [issues, setIssues] = useState([]);
  const [activeSeverity, setActiveSeverity] = useState("");
  const [activeStatus, setActiveStatus] = useState("open");

  // Create Issue Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState("medium");
  const [creating, setCreating] = useState(false);

  const fetchIssues = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await staffApi.getIssues({
        status: activeStatus || undefined,
        severity: activeSeverity || undefined,
        page: 1,
        limit: 100
      });
      if (response.success) {
        setIssues(response.data.items || []);
      }
    } catch (err) {
      console.warn("Failed loading staff issues:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStatus, activeSeverity]);

  useFocusEffect(
    useCallback(() => {
      fetchIssues();
    }, [fetchIssues])
  );

  // Pre-fill fields trigger checks
  useEffect(() => {
    if (params.preFillTitle || params.preFillDesc) {
      setNewTitle(params.preFillTitle || "");
      setNewDesc(params.preFillDesc || "");
      setNewSeverity("high");
      setModalVisible(true);
    }
  }, [params]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIssues(true);
  }, [fetchIssues]);

  async function handleCreateIssue() {
    if (!newTitle.trim() || !newDesc.trim()) return;
    setCreating(true);
    try {
      const response = await staffApi.createIssue({
        title: newTitle,
        description: newDesc,
        severity: newSeverity
      });
      if (response.success) {
        setModalVisible(false);
        setNewTitle("");
        setNewDesc("");
        setNewSeverity("medium");
        fetchIssues();
      }
    } catch (err) {
      console.warn("Error creating issue:", err);
    } finally {
      setCreating(false);
    }
  }

  function getSeverityColor(sev) {
    switch (sev?.toLowerCase()) {
      case "critical": return COLORS.error;
      case "high": return COLORS.warning;
      case "medium": return COLORS.info;
      default: return COLORS.mutedText;
    }
  }

  function renderIssueCard({ item }) {
    const sevColor = getSeverityColor(item.severity);
    return (
      <TouchableOpacity
        style={styles.issueCard}
        onPress={() => router.push(`/issues/${item._id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.issueTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.sevBadge, { backgroundColor: sevColor + "1A", borderColor: sevColor }]}>
            <Text style={[styles.sevBadgeText, { color: sevColor }]}>{item.severity}</Text>
          </View>
        </View>
        <Text style={styles.issueDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.reporterText}>Reporter: {item.reporterId?.fullName || "Staff"}</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Reported Issues</Text>
          <Text style={styles.subtitle}>Track, investigate, and resolve system or property bottlenecks.</Text>
        </View>
      </View>

      {/* Action shortcuts */}
      <TouchableOpacity style={styles.floatingReportBtn} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.floatingBtnText}>Log New Issue</Text>
      </TouchableOpacity>

      {/* Severity horizontal filters */}
      <View style={styles.tabScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SEVERITIES}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.sevScroll}
          renderItem={({ item }) => {
            const isSelected = activeSeverity === item.value;
            return (
              <TouchableOpacity
                style={[styles.sevFilter, isSelected && styles.sevFilterActive]}
                onPress={() => setActiveSeverity(item.value)}
              >
                <Text style={[styles.sevFilterLabel, isSelected && styles.sevFilterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Status Column Segments */}
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

      {/* Issues list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item._id}
          renderItem={renderIssueCard}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bug-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>Clear logs!</Text>
              <Text style={styles.emptySubtitle}>No open issues reported matching your active criteria.</Text>
            </View>
          }
        />
      )}

      {/* Modal Creator Sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Operational Issue</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>ISSUE TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Booking lock up on checkout"
                placeholderTextColor={COLORS.placeholder}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>DESCRIPTION & INCIDENT DETAILS</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholder="Describe what occurred, impact, and associated property or inspection detail..."
                placeholderTextColor={COLORS.placeholder}
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <Text style={styles.inputLabel}>SEVERITY LEVEL</Text>
              <View style={styles.severitySelectorRow}>
                {["low", "medium", "high", "critical"].map((lvl) => {
                  const isSel = newSeverity === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.sevSelectBtn, isSel && styles.sevSelectBtnActive, isSel && { borderColor: getSeverityColor(lvl) }]}
                      onPress={() => setNewSeverity(lvl)}
                    >
                      <Text style={[styles.sevSelectLabel, isSel && { color: getSeverityColor(lvl), fontWeight: "700" }]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {creating ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.formLoader} />
              ) : (
                <TouchableOpacity
                  style={[styles.submitFormBtn, (!newTitle.trim() || !newDesc.trim()) && styles.submitFormBtnDisabled]}
                  onPress={handleCreateIssue}
                  disabled={!newTitle.trim() || !newDesc.trim()}
                >
                  <Text style={styles.submitFormBtnText}>Log Issue</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12
  },
  backIconButton: {
    width: 36,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  headerTitles: {
    flex: 1,
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
    lineHeight: 15
  },
  floatingReportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2
  },
  floatingBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  tabScrollContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 6
  },
  sevScroll: {
    paddingHorizontal: 20,
    gap: 8
  },
  sevFilter: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  sevFilterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  sevFilterLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  sevFilterLabelActive: {
    color: COLORS.white,
    fontWeight: "600"
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
  issueCard: {
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
    alignItems: "center",
    gap: 10
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1
  },
  sevBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  issueDesc: {
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
    paddingTop: 8,
    marginTop: 2
  },
  reporterText: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  dateText: {
    fontSize: 10,
    color: COLORS.placeholder
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: "center",
    maxWidth: "80%"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary
  },
  modalForm: {
    gap: 14,
    paddingBottom: 24
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: COLORS.text
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingVertical: 10
  },
  severitySelectorRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  sevSelectBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  sevSelectBtnActive: {
    backgroundColor: COLORS.inputBackground
  },
  sevSelectLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    textTransform: "capitalize",
    fontWeight: "500"
  },
  submitFormBtn: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2
  },
  submitFormBtnDisabled: {
    opacity: 0.5
  },
  submitFormBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  formLoader: {
    marginVertical: 14
  }
});
