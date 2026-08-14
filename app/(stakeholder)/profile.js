import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { stakeholderApi } from "../../services/stakeholderApi";

export default function StakeholderProfileScreen() {
  const router = useRouter();
  const { userProfile, logout, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");

  // Report generation state
  const [generating, setGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCsv, setReportCsv] = useState("");
  const [reportVisible, setReportVisible] = useState(false);

  async function handleSave() {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ fullName, phone });
      Alert.alert("Success", "Executive profile updated.");
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not save details.");
    } finally {
      setSaving(false);
    }
  }

  async function triggerReport(type) {
    setGenerating(true);
    let title = "Properties Portfolio Report";
    let fetchFn = stakeholderApi.exportPropertiesReport;

    if (type === "performance") {
      title = "Brokers Performance Report";
      fetchFn = stakeholderApi.exportPerformanceReport;
    } else if (type === "operations") {
      title = "Operations Velocity Report";
      fetchFn = stakeholderApi.exportOperationsReport;
    }

    setReportTitle(title);
    try {
      const response = await fetchFn();
      if (response.success) {
        setReportCsv(response.data);
        setReportVisible(true);
      } else {
        Alert.alert("Error", response.message || "Failed to compile spreadsheet logs.");
      }
    } catch (err) {
      Alert.alert("Error", "Network timeout occurred while exporting report.");
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyToClipboard() {
    Clipboard.setString(reportCsv);
    Alert.alert("Copied", "Spreadsheet CSV rows copied to device clipboard!");
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Director Settings</Text>
        <Text style={styles.subtitle}>Executive configuration, notifications, and portfolio exports.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <View style={styles.form}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={COLORS.placeholder}
            />

            <Text style={styles.label}>MOBILE PHONE</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g., +234 80 1234 5678"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
            />

            {saving ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Business Intelligence Exports */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Intelligence Exports</Text>
          <Text style={styles.cardDesc}>Download executive raw spreadsheets containing operational metrics.</Text>

          {generating ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : (
            <View style={styles.exportList}>
              <TouchableOpacity style={styles.exportBtn} onPress={() => triggerReport("properties")}>
                <View style={styles.exportLeft}>
                  <Ionicons name="document-text" size={20} color={COLORS.primary} />
                  <Text style={styles.exportLabel}>Properties Portfolio (.csv)</Text>
                </View>
                <Ionicons name="cloud-download-outline" size={18} color={COLORS.mutedText} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportBtn} onPress={() => triggerReport("performance")}>
                <View style={styles.exportLeft}>
                  <Ionicons name="people" size={20} color={COLORS.primary} />
                  <Text style={styles.exportLabel}>Realtor Performance (.csv)</Text>
                </View>
                <Ionicons name="cloud-download-outline" size={18} color={COLORS.mutedText} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportBtn} onPress={() => triggerReport("operations")}>
                <View style={styles.exportLeft}>
                  <Ionicons name="speedometer" size={20} color={COLORS.primary} />
                  <Text style={styles.exportLabel}>Operations Velocity (.csv)</Text>
                </View>
                <Ionicons name="cloud-download-outline" size={18} color={COLORS.mutedText} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out of Executive Workspace</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CSV Preview Tray Modal */}
      <Modal visible={reportVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="document-text" size={20} color={COLORS.success} />
                <Text style={styles.modalTitle}>{reportTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setReportVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.successText}>Spreadsheet compiled successfully!</Text>
              </View>

              <View style={styles.previewActions}>
                <Text style={styles.previewLabel}>CSV Raw Spreadsheet Preview:</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyToClipboard}>
                  <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.copyBtnText}>Copy Rows</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.csvPreviewFrame} contentContainerStyle={styles.csvPreviewContent}>
                <Text style={styles.csvText}>{reportCsv}</Text>
              </ScrollView>
            </View>
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
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.mutedText,
    lineHeight: 15
  },
  form: {
    gap: 10
  },
  label: {
    fontSize: 9,
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
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  loader: {
    marginVertical: 14
  },
  exportList: {
    gap: 10
  },
  exportBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12
  },
  exportLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  exportLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700"
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
    maxHeight: "80%",
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
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  modalBody: {
    gap: 12,
    paddingBottom: 24
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSurface,
    padding: 10,
    borderRadius: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  successText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600"
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mutedText
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.softPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary
  },
  csvPreviewFrame: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    maxHeight: 200
  },
  csvPreviewContent: {
    padding: 12
  },
  csvText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: COLORS.mutedText,
    lineHeight: 16
  }
});
