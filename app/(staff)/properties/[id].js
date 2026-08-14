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
  Switch
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { staffApi } from "../../../services/staffApi";

export default function StaffPropertyVerifyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Checklist states
  const [imagesAcceptable, setImagesAcceptable] = useState(true);
  const [locationComplete, setLocationComplete] = useState(true);
  const [pricingComplete, setPricingComplete] = useState(true);
  const [descriptionComplete, setDescriptionComplete] = useState(true);
  const [requiredInfoPresent, setRequiredInfoPresent] = useState(true);

  async function fetchReviewDetails() {
    setLoading(true);
    try {
      const response = await staffApi.getPropertyReview(id);
      if (response.success) {
        setProperty(response.data.property);
        setHistory(response.data.history || []);
      }
    } catch (err) {
      console.warn("Failed loading property details:", err);
      Alert.alert("Error", "Could not load verification records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviewDetails();
  }, [id]);

  const checklist = {
    imagesAcceptable,
    locationComplete,
    pricingComplete,
    descriptionComplete,
    requiredInfoPresent
  };

  async function handleApprove() {
    // Confirm approval
    Alert.alert(
      "Approve Listing",
      "Are you sure this listing meets all quality requirements? It will instantly go active on the market.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setUpdating(true);
            try {
              const response = await staffApi.verifyProperty(id, checklist);
              if (response.success) {
                Alert.alert("Listing Approved", "Property is now active and live!");
                router.back();
              }
            } catch (err) {
              Alert.alert("Error", err?.message || "Could not approve property.");
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  }

  async function handleRequestChanges() {
    // Must supply a reason text
    Alert.prompt(
      "Request Corrections",
      "Explain clearly to the Realtor what needs to be edited (minimum 5 characters):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async (reason) => {
            if (!reason || reason.trim().length < 5) {
              Alert.alert("Error", "A valid reason of at least 5 characters is required.");
              return;
            }
            setUpdating(true);
            try {
              const response = await staffApi.requestPropertyChanges(id, reason, checklist);
              if (response.success) {
                Alert.alert("Review Submitted", "corrections requested from the Realtor.");
                router.back();
              }
            } catch (err) {
              Alert.alert("Error", err?.message || "Could not submit changes request.");
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

  if (!property) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Property not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing Auditor</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Cover & Details */}
        <View style={styles.coverCard}>
          <Image source={{ uri: property.coverImage?.url }} style={styles.coverImage} />
          <View style={styles.coverInfo}>
            <Text style={styles.priceText}>₦{property.price?.toLocaleString()}</Text>
            <Text style={styles.propTitle}>{property.title}</Text>
            <Text style={styles.addressText}>
              {property.address?.street}, {property.address?.city}, {property.address?.state}
            </Text>
          </View>
        </View>

        {/* Realtor ownership profile info */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>Listing Realtor</Text>
          <View style={styles.realtorInfo}>
            <View style={styles.avatarMock}>
              <Ionicons name="person" size={20} color={COLORS.mutedText} />
            </View>
            <View>
              <Text style={styles.realtorName}>{property.realtorId?.fullName || "Broker"}</Text>
              <Text style={styles.realtorSub}>{property.realtorId?.email} | {property.realtorId?.phone || "No Phone"}</Text>
              {property.realtorId?.agency && (
                <Text style={styles.realtorAgency}>Agency: {property.realtorId.agency}</Text>
              )}
            </View>
          </View>
        </View>

        {/* 1. Interactive Auditor Checklist */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>Auditor Checklist</Text>
          <Text style={styles.checklistHint}>Toggle toggles off to highlight errors for requested changes.</Text>

          <View style={styles.checklistRow}>
            <View style={styles.checklistMeta}>
              <Text style={styles.checkTitle}>Images Acceptable</Text>
              <Text style={styles.checkSub}>Images are high resolution, appropriate, and clear.</Text>
            </View>
            <Switch
              value={imagesAcceptable}
              onValueChange={setImagesAcceptable}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.checklistRow}>
            <View style={styles.checklistMeta}>
              <Text style={styles.checkTitle}>Address & Location Complete</Text>
              <Text style={styles.checkSub}>Street, City, State, and Country are fully filled.</Text>
            </View>
            <Switch
              value={locationComplete}
              onValueChange={setLocationComplete}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.checklistRow}>
            <View style={styles.checklistMeta}>
              <Text style={styles.checkTitle}>Pricing Metrics Accurate</Text>
              <Text style={styles.checkSub}>Pricing boundaries reflect market valuations.</Text>
            </View>
            <Switch
              value={pricingComplete}
              onValueChange={pricingComplete}
              trackColor={{ true: COLORS.primary }}
              disabled // Locked as validated unless other flows request it
            />
          </View>

          <View style={styles.checklistRow}>
            <View style={styles.checklistMeta}>
              <Text style={styles.checkTitle}>Description Complete</Text>
              <Text style={styles.checkSub}>Professional copy without spelling errors.</Text>
            </View>
            <Switch
              value={descriptionComplete}
              onValueChange={setDescriptionComplete}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.checklistRow}>
            <View style={styles.checklistMeta}>
              <Text style={styles.checkTitle}>Information Checklist</Text>
              <Text style={styles.checkSub}>Bedrooms, bathrooms, amenities, and details present.</Text>
            </View>
            <Switch
              value={requiredInfoPresent}
              onValueChange={setRequiredInfoPresent}
              trackColor={{ true: COLORS.primary }}
            />
          </View>
        </View>

        {/* 2. Review History */}
        {history.length > 0 && (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Review History Logs</Text>
            {history.map((log, index) => {
              const isVerified = log.action === "verified";
              return (
                <View
                  key={log._id || index}
                  style={[
                    styles.historyItem,
                    index < history.length - 1 && styles.itemDivider
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <View style={[styles.actionTag, { backgroundColor: isVerified ? COLORS.successSurface : COLORS.errorSurface }]}>
                      <Text style={[styles.actionTagText, { color: isVerified ? COLORS.success : COLORS.error }]}>
                        {log.action?.replace("_", " ")}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{new Date(log.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.historyReason}>"{log.reason}"</Text>
                  <Text style={styles.historyReviewer}>Auditor: {log.reviewerId?.fullName || "Staff"}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions buttons */}
        {updating ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttonsGroup}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: COLORS.success }]}
              onPress={handleApprove}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.btnText}>Approve & Publish Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: COLORS.error }]}
              onPress={handleRequestChanges}
            >
              <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.btnText}>Request Corrections</Text>
            </TouchableOpacity>
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
  coverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden"
  },
  coverImage: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.surfaceMuted
  },
  coverInfo: {
    padding: 16,
    gap: 4
  },
  priceText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary
  },
  propTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text
  },
  addressText: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text
  },
  realtorInfo: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  avatarMock: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  realtorName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text
  },
  realtorSub: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  realtorAgency: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "500"
  },
  checklistHint: {
    fontSize: 11,
    color: COLORS.mutedText,
    lineHeight: 14,
    marginBottom: 4
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
    gap: 10
  },
  checklistMeta: {
    flex: 1,
    gap: 2
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text
  },
  checkSub: {
    fontSize: 11,
    color: COLORS.mutedText
  },
  historyItem: {
    paddingVertical: 10,
    gap: 6
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actionTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.placeholder
  },
  historyReason: {
    fontSize: 12,
    color: COLORS.text,
    fontStyle: "italic",
    lineHeight: 16
  },
  historyReviewer: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: "500"
  },
  buttonsGroup: {
    gap: 10,
    marginTop: 8
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2
  },
  btnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  loader: {
    marginVertical: 12
  }
});
