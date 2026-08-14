import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { staffApi } from "../../../services/staffApi";

export default function StaffTaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [updating, setUpdating] = useState(false);

  async function fetchTaskDetail() {
    setLoading(true);
    try {
      const response = await staffApi.getTask(id);
      if (response.success) {
        setTask(response.data);
      }
    } catch (err) {
      console.warn("Failed loading task details:", err);
      Alert.alert("Error", "Could not load task information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  async function handleStatusTransition(newStatus) {
    setUpdating(true);
    try {
      const response = await staffApi.updateTask(id, { status: newStatus });
      if (response.success) {
        setTask(response.data);
        Alert.alert("Task Updated", `Status is now: ${newStatus.replace("_", " ").toUpperCase()}`);
      }
    } catch (err) {
      Alert.alert("Transition Failed", err?.message || "Could not transition status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleReassign() {
    // Reassignment trigger prompt.
    // In a production workspace, we list other staff, but here we can prompt for a custom Mongo ID or input.
    Alert.prompt(
      "Reassign Task",
      "Enter the target Staff Mongo ID to assign this task to:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reassign",
          onPress: async (targetId) => {
            if (!targetId || targetId.length !== 24) {
              Alert.alert("Invalid ID", "Please enter a valid 24-character Mongo ID.");
              return;
            }
            setUpdating(true);
            try {
              const response = await staffApi.reassignTask(id, targetId);
              if (response.success) {
                Alert.alert("Task Reassigned", "Task has been reassigned. Redirecting...");
                router.back();
              }
            } catch (err) {
              Alert.alert("Reassignment Failed", err?.message || "Could not reassign task.");
            } finally {
              setUpdating(false);
            }
          }
        }
      ],
      "plain-text"
    );
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  if (!task) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Task not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const isClosed = ["completed", "cancelled"].includes(task.status);

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Inspector</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Priority and Status Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, styles[`badge_${task.status}`]]}>
            <Text style={styles.badgeText}>{task.status?.replace("_", " ")}</Text>
          </View>
          <View style={[styles.priorityBadge, styles[`badge_${task.priority}`]]}>
            <Text style={styles.badgeText}>{task.priority} priority</Text>
          </View>
        </View>

        {/* Task Details */}
        <View style={styles.contentCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={16} color={COLORS.secondary} />
            <View>
              <Text style={styles.metaLabel}>DUE DATE</Text>
              <Text style={styles.metaValue}>
                {new Date(task.dueAt).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {task.type && (
            <View style={styles.metaRow}>
              <Ionicons name="construct" size={16} color={COLORS.secondary} />
              <View>
                <Text style={styles.metaLabel}>WORK CATEGORY</Text>
                <Text style={styles.metaValue}>{task.type.toUpperCase()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Operational Controls</Text>
          
          {updating ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : isClosed ? (
            <View style={styles.terminalContainer}>
              <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
              <Text style={styles.terminalText}>This task is finalized and closed.</Text>
            </View>
          ) : (
            <View style={styles.buttonsGroup}>
              {task.status === "pending" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => handleStatusTransition("in_progress")}
                >
                  <Ionicons name="play" size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Start Progress</Text>
                </TouchableOpacity>
              )}

              {task.status === "in_progress" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => handleStatusTransition("completed")}
                  >
                    <Ionicons name="checkmark" size={18} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>Complete Task</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.warning }]}
                    onPress={() => handleStatusTransition("blocked")}
                  >
                    <Ionicons name="pause" size={18} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>Block Task</Text>
                  </TouchableOpacity>
                </>
              )}

              {task.status === "blocked" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => handleStatusTransition("in_progress")}
                >
                  <Ionicons name="play" size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Resume Progress</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.surface, borderWith: 1, borderColor: COLORS.border }]}
                onPress={handleReassign}
              >
                <Ionicons name="arrow-redo" size={18} color={COLORS.text} />
                <Text style={[styles.actionBtnText, { color: COLORS.text }]}>Reassign Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.background
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: "600"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary
  },
  placeholder: {
    width: 32
  },
  scrollContainer: {
    padding: 20,
    gap: 16
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: COLORS.white
  },
  badge_pending: { backgroundColor: COLORS.placeholder },
  badge_in_progress: { backgroundColor: COLORS.info },
  badge_blocked: { backgroundColor: COLORS.warning },
  badge_completed: { backgroundColor: COLORS.success },
  badge_cancelled: { backgroundColor: COLORS.error },
  badge_low: { backgroundColor: COLORS.mutedText },
  badge_medium: { backgroundColor: COLORS.info },
  badge_high: { backgroundColor: COLORS.warning },
  badge_critical: { backgroundColor: COLORS.error },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 12
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 22
  },
  taskDesc: {
    fontSize: 13,
    color: COLORS.mutedText,
    lineHeight: 18
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.inputBackground,
    marginVertical: 4
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text
  },
  actionsContainer: {
    gap: 10
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text
  },
  buttonsGroup: {
    gap: 10
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  loader: {
    marginVertical: 12
  },
  terminalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.successSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8
  },
  terminalText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.success
  }
});
