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
  Image,
  TextInput
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { staffApi } from "../../../services/staffApi";

export default function StaffInspectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [noteText, setNoteText] = useState("");

  async function fetchBookingDetail() {
    setLoading(true);
    try {
      const response = await staffApi.getInspection(id);
      if (response.success) {
        setBooking(response.data);
        setNoteText(response.data.message || "");
      }
    } catch (err) {
      console.warn("Failed loading inspection booking:", err);
      Alert.alert("Error", "Could not load inspection data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      const response = await staffApi.updateInspection(id, { status: newStatus });
      if (response.success) {
        setBooking(response.data);
        Alert.alert("Inspection Updated", `Status is now: ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      Alert.alert("Failed", err?.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveNotes() {
    if (!noteText.trim()) return;
    setUpdating(true);
    try {
      const response = await staffApi.updateInspection(id, { notes: noteText });
      if (response.success) {
        setBooking(response.data);
        Alert.alert("Success", "Operational notes recorded.");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not record notes.");
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

  if (!booking) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Inspection not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const isTerminal = ["completed", "cancelled", "rejected"].includes(booking.status);

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Desk</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Scheduled date banner */}
        <View style={styles.scheduleBanner}>
          <Ionicons name="time-outline" size={24} color={COLORS.primary} />
          <View>
            <Text style={styles.bannerDate}>
              {new Date(booking.scheduledAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={styles.bannerTime}>
              Time: {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.timezone})
            </Text>
          </View>
        </View>

        {/* Property Specs card */}
        {booking.propertyId && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Viewing Property</Text>
            <View style={styles.propertyRow}>
              <Image source={{ uri: booking.propertyId.coverImage?.url }} style={styles.propImage} />
              <View style={styles.propMeta}>
                <Text style={styles.propTitle} numberOfLines={1}>{booking.propertyId.title}</Text>
                <Text style={styles.propSub} numberOfLines={1}>
                  {booking.propertyId.address?.street}, {booking.propertyId.address?.city}
                </Text>
                <Text style={styles.propPrice}>₦{booking.propertyId.price?.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contacts Directories */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Client & Realtor Directory</Text>
          
          <View style={styles.directoryRow}>
            <View style={styles.directoryLeft}>
              <Ionicons name="person" size={18} color={COLORS.secondary} />
              <View>
                <Text style={styles.directoryLabel}>BUYER (CLIENT)</Text>
                <Text style={styles.directoryName}>{booking.userId?.fullName || "Prospective Buyer"}</Text>
                <Text style={styles.directorySub}>{booking.userId?.email} | {booking.userId?.phone || "No phone"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.directoryRow}>
            <View style={styles.directoryLeft}>
              <Ionicons name="business" size={18} color={COLORS.secondary} />
              <View>
                <Text style={styles.directoryLabel}>REALTOR (AGENT)</Text>
                <Text style={styles.directoryName}>{booking.realtorId?.fullName || "Broker"}</Text>
                <Text style={styles.directorySub}>{booking.realtorId?.email} | {booking.realtorId?.phone || "No phone"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Operations Notes */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Operational Log & Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={3}
            placeholder="Record attendee arrival logs, property issues, client feedback, or incident notes..."
            placeholderTextColor={COLORS.placeholder}
            value={noteText}
            onChangeText={setNoteText}
          />
          <TouchableOpacity
            style={[styles.saveNotesBtn, !noteText.trim() && styles.saveNotesBtnDisabled]}
            onPress={handleSaveNotes}
            disabled={!noteText.trim() || updating}
          >
            <Text style={styles.saveNotesBtnText}>Log Notes</Text>
          </TouchableOpacity>
        </View>

        {/* Controlled Status Toggles */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Controlled Status Updates</Text>
          
          {updating ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : isTerminal ? (
            <View style={styles.terminalContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.mutedText} />
              <Text style={styles.terminalText}>This booking is closed ({booking.status}).</Text>
            </View>
          ) : (
            <View style={styles.buttonsGroup}>
              {booking.status === "pending" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                  onPress={() => handleStatusChange("confirmed")}
                >
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Confirm Inspection Details</Text>
                </TouchableOpacity>
              )}

              {booking.status === "confirmed" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => handleStatusChange("in_progress")}
                >
                  <Ionicons name="play" size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Mark Arrived / In Progress</Text>
                </TouchableOpacity>
              )}

              {booking.status === "in_progress" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                  onPress={() => handleStatusChange("completed")}
                >
                  <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Conclude Inspection Complete</Text>
                </TouchableOpacity>
              )}

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[styles.rowBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                  onPress={() => handleStatusChange("no_show")}
                >
                  <Text style={[styles.rowBtnText, { color: COLORS.text }]}>No Show</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rowBtn, { backgroundColor: COLORS.errorSurface, borderColor: COLORS.error }]}
                  onPress={() => handleStatusChange("cancelled")}
                >
                  <Text style={[styles.rowBtnText, { color: COLORS.error }]}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.reportIncidentBtn}
                onPress={() => {
                  router.push(`/issues?preFillTitle=${encodeURIComponent("Inspection Issue")}&preFillDesc=${encodeURIComponent(`Inspection #${booking._id} on ${booking.propertyId?.title || "Property"}`)}`);
                }}
              >
                <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                <Text style={styles.reportIncidentText}>Report Problem / Incident</Text>
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
  scheduleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softPrimary,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  bannerDate: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary
  },
  bannerTime: {
    fontSize: 12,
    color: COLORS.mutedText
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  propertyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  propImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted
  },
  propMeta: {
    flex: 1,
    gap: 2
  },
  propTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  propSub: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  propPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  directoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  directoryLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  directoryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  directoryName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  directorySub: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.inputBackground,
    marginVertical: 4
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
    minHeight: 70
  },
  saveNotesBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  saveNotesBtnDisabled: {
    opacity: 0.5
  },
  saveNotesBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },
  actionsContainer: {
    gap: 10
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
  rowButtons: {
    flexDirection: "row",
    gap: 10
  },
  rowBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  rowBtnText: {
    fontSize: 12,
    fontWeight: "700"
  },
  reportIncidentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderStyle: "dashed"
  },
  reportIncidentText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "700"
  },
  loader: {
    marginVertical: 12
  },
  terminalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 8,
    gap: 8
  },
  terminalText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.mutedText
  }
});
