import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { staffApi } from "../../../services/staffApi";

export default function StaffIssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [resolutionText, setResolutionText] = useState("");

  async function fetchIssueDetail() {
    setLoading(true);
    try {
      const response = await staffApi.getIssue(id);
      if (response.success) {
        setIssue(response.data);
        setResolutionText(response.data.resolution || "");
      }
    } catch (err) {
      console.warn("Failed loading issue detail:", err);
      Alert.alert("Error", "Could not load issue profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  async function handleStatusTransition(newStatus) {
    const payload = { status: newStatus };
    if (newStatus === "resolved") {
      if (!resolutionText.trim()) {
        Alert.alert("Error", "Please fill out the resolution summary text before resolving this issue.");
        return;
      }
      payload.resolution = resolutionText;
    }

    setUpdating(true);
    try {
      const response = await staffApi.updateIssue(id, payload);
      if (response.success) {
        setIssue(response.data);
        Alert.alert("Success", `Issue status is now: ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAddNotes() {
    if (!notesText.trim()) return;
    setUpdating(true);
    try {
      const response = await staffApi.updateIssue(id, { notes: notesText });
      if (response.success) {
        setIssue(response.data);
        setNotesText("");
        Alert.alert("Success", "Operational note recorded.");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not add notes.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  if (!issue) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Issue file not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  function getSeverityColor(sev) {
    switch (sev?.toLowerCase()) {
      case "critical": return COLORS.error;
      case "high": return COLORS.warning;
      case "medium": return COLORS.info;
      default: return COLORS.mutedText;
    }
  }

  const sevColor = getSeverityColor(issue.severity);
  const isResolved = issue.status === "resolved";

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Inspector</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Status Indicators */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, styles[`status_${issue.status}`]]}>
            <Text style={styles.badgeText}>{issue.status}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sevColor }]}>
            <Text style={styles.badgeText}>{issue.severity} severity</Text>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.issueTitle}>{issue.title}</Text>
          <Text style={styles.issueDesc}>{issue.description}</Text>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Ionicons name="person" size={14} color={COLORS.mutedText} />
            <Text style={styles.metaValue}>Reporter: {issue.reporterId?.fullName || "Staff Member"}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time" size={14} color={COLORS.mutedText} />
            <Text style={styles.metaValue}>Logged: {new Date(issue.createdAt).toLocaleString()}</Text>
          </View>

          {issue.propertyId && (
            <View style={styles.metaRow}>
              <Ionicons name="business" size={14} color={COLORS.secondary} />
              <TouchableOpacity onPress={() => router.push(`/properties/${issue.propertyId}`)}>
                <Text style={[styles.metaValue, styles.linkText]}>Linked Property File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Resolution summary card */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Resolution Log</Text>
          {isResolved ? (
            <View style={styles.resolvedContainer}>
              <Ionicons name="checkmark-done" size={20} color={COLORS.success} />
              <Text style={styles.resolvedText}>Resolved: "{issue.resolution}"</Text>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={2}
                placeholder="Explain resolution details before marking resolved..."
                placeholderTextColor={COLORS.placeholder}
                value={resolutionText}
                onChangeText={setResolutionText}
              />
              <TouchableOpacity
                style={[styles.resolveBtn, !resolutionText.trim() && styles.resolveBtnDisabled]}
                onPress={() => handleStatusTransition("resolved")}
                disabled={!resolutionText.trim() || updating}
              >
                <Text style={styles.resolveBtnText}>Complete Resolution</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Timeline Notes Logger */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Add Investigator Note</Text>
          <View style={styles.formGroup}>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={2}
              placeholder="Record diagnostic traces, investigation reports, or operational updates..."
              placeholderTextColor={COLORS.placeholder}
              value={notesText}
              onChangeText={setNotesText}
            />
            <TouchableOpacity
              style={[styles.addNotesBtn, !notesText.trim() && styles.addNotesBtnDisabled]}
              onPress={handleAddNotes}
              disabled={!notesText.trim() || updating}
            >
              <Text style={styles.addNotesBtnText}>Log Note</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline Notes History */}
          {issue.notes?.length > 0 && (
            <View style={styles.notesTimeline}>
              <Text style={styles.timelineTitle}>Investigation Timeline</Text>
              {issue.notes.map((note, index) => (
                <View key={note._id || index} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.noteAuthor}>{note.authorId?.fullName || "Staff"}</Text>
                    <Text style={styles.noteDate}>{new Date(note.createdAt).toLocaleString()}</Text>
                    <Text style={styles.noteText}>"{note.content}"</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Status transitions options */}
        {!isResolved && (
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Investigator Transitions</Text>
            {updating ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : (
              <View style={styles.statusButtonsGroup}>
                <TouchableOpacity
                  style={[styles.statusBtn, issue.status === "investigating" && styles.statusBtnActive]}
                  onPress={() => handleStatusTransition("investigating")}
                >
                  <Text style={styles.statusBtnLabel}>Investigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, issue.status === "waiting" && styles.statusBtnActive]}
                  onPress={() => handleStatusTransition("waiting")}
                >
                  <Text style={styles.statusBtnLabel}>Hold / Wait</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: COLORS.white
  },
  status_open: { backgroundColor: COLORS.error },
  status_investigating: { backgroundColor: COLORS.info },
  status_waiting: { backgroundColor: COLORS.warning },
  status_resolved: { backgroundColor: COLORS.success },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 20
  },
  issueDesc: {
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
    gap: 8
  },
  metaValue: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "700",
    textDecorationLine: "underline"
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  resolvedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  resolvedText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600",
    flex: 1
  },
  formGroup: {
    gap: 10
  },
  notesInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    fontSize: 13,
    color: COLORS.text,
    textAlignVertical: "top",
    minHeight: 56
  },
  resolveBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  resolveBtnDisabled: {
    opacity: 0.5
  },
  resolveBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  addNotesBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  addNotesBtnDisabled: {
    opacity: 0.5
  },
  addNotesBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  notesTimeline: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBackground,
    paddingTop: 14,
    gap: 12
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.mutedText
  },
  timelineItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginTop: 5
  },
  timelineContent: {
    flex: 1,
    gap: 1
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text
  },
  noteDate: {
    fontSize: 10,
    color: COLORS.placeholder
  },
  noteText: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontStyle: "italic",
    marginTop: 2
  },
  actionsContainer: {
    gap: 10
  },
  statusButtonsGroup: {
    flexDirection: "row",
    gap: 10
  },
  statusBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  statusBtnActive: {
    backgroundColor: COLORS.softPrimary,
    borderColor: COLORS.primary
  },
  statusBtnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text
  },
  loader: {
    marginVertical: 12
  }
});
