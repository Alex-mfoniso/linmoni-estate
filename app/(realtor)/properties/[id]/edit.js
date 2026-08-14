import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import EmptyState from "../../../../components/EmptyState";
import AppHeader from "../../../../components/AppHeader";
import AppInput from "../../../../components/AppInput";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import PrimaryButton from "../../../../components/PrimaryButton";
import PropertyImageUploader from "../../../../components/PropertyImageUploader";
import ScreenContainer from "../../../../components/ScreenContainer";
import COLORS from "../../../../constants/colors";
import { useAuth } from "../../../../contexts/AuthContext";
import { uploadMultipleImages } from "../../../../services/cloudinaryService";
import { realtorApi } from "../../../../services/realtorApi";
import {
  buildEditableImageItems,
  isLocalImageItem,
  preparePropertyImagesForSave,
} from "../../../../utils/propertyMedia";

function isValidNumber(value) {
  if (value === "" || value === null || typeof value === "undefined") {
    return true;
  }
  return Number.isFinite(Number(value));
}

export default function EditPropertyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    street: "",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    propertyType: "apartment",
    listingType: "sale",
    bedrooms: "",
    bathrooms: "",
    areaSqFt: "",
    features: ""
  });
  const [images, setImages] = useState([]);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const res = await realtorApi.getProperty(String(params.id || ""));
        if (!res || !res.success || !res.data?.property) {
          throw new Error("Property not found or access denied.");
        }

        const item = res.data.property;

        if (active) {
          setProperty(item);
          setForm({
            title: item.title || "",
            description: item.description || "",
            price: String(item.price ?? ""),
            street: item.address?.street || "",
            city: item.address?.city || "Lagos",
            state: item.address?.state || "Lagos",
            country: item.address?.country || "Nigeria",
            propertyType: item.propertyType || "apartment",
            listingType: item.listingType || "sale",
            bedrooms: String(item.details?.bedrooms ?? ""),
            bathrooms: String(item.details?.bathrooms ?? ""),
            areaSqFt: String(item.details?.areaSqFt ?? ""),
            features: item.features ? item.features.join(", ") : ""
          });
          setImages(buildEditableImageItems(item));
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load this property.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProperty();

    return () => {
      active = false;
    };
  }, [params.id]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(submit = false) {
    if (saving || savingDraft || !property) {
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.price.trim() || !form.street.trim()) {
      Alert.alert("Missing details", "Please fill in all required fields: Title, Description, Price, and Street Address.");
      return;
    }

    if (
      !isValidNumber(form.price) ||
      !isValidNumber(form.bedrooms) ||
      !isValidNumber(form.bathrooms) ||
      (form.areaSqFt && !isValidNumber(form.areaSqFt))
    ) {
      Alert.alert("Invalid input", "Please enter valid numeric values for price, bedrooms, bathrooms, and area.");
      return;
    }

    if (submit) {
      setSaving(true);
    } else {
      setSavingDraft(true);
    }

    try {
      const localItems = images.filter(isLocalImageItem);
      const uploadedImages = localItems.length
        ? await uploadMultipleImages(localItems, {
            folder: "linpal-premium-estates/properties",
          })
        : [];

      let uploadIndex = 0;
      const finalizedItems = images.map((item) => {
        if (!isLocalImageItem(item)) {
          return item;
        }

        const uploaded = uploadedImages[uploadIndex++];
        return {
          ...uploaded,
          isCover: Boolean(item.isCover),
          sourceType: "remote",
          uri: uploaded.secureUrl,
        };
      });

      const savedMedia = preparePropertyImagesForSave(finalizedItems);
      const coverImage = savedMedia.coverImage?.secureUrl
        ? { url: savedMedia.coverImage.secureUrl, publicId: savedMedia.coverImage.publicId }
        : null;
      const imagesPayload = (savedMedia.images || []).map((img) => ({
        url: img.secureUrl,
        publicId: img.publicId,
      }));

      const normPropertyType = form.propertyType.trim().toLowerCase();
      const normListingType = form.listingType.trim().toLowerCase();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: normPropertyType,
        listingType: normListingType,
        price: Number(form.price),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          postalCode: ""
        },
        details: {
          bedrooms: Number(form.bedrooms || 0),
          bathrooms: Number(form.bathrooms || 0),
          areaSqFt: Number(form.areaSqFt || 1200)
        },
        coverImage,
        images: imagesPayload,
        features: form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : [],
        submit
      };

      const res = await realtorApi.updateProperty(property.id, payload);

      if (res && res.success) {
        Alert.alert(
          submit ? "Listing Submitted" : "Draft Updated",
          submit
            ? "Your edits have been saved and submitted for admin review."
            : "Your draft edits have been saved.",
          [{ text: "OK", onPress: () => router.replace(`/(realtor)/properties/${property.id}`) }]
        );
      } else {
        Alert.alert("Error", "Could not complete update.");
      }
    } catch (err) {
      console.error("Update property error:", err);
      Alert.alert("Save property failed", err?.message || "Unable to update this property.");
    } finally {
      setSaving(false);
      setSavingDraft(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading property record..." />;
  }

  if (error || !property) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Edit Property"
          subtitle="Update your listing and media."
          userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
          role={(userProfile?.role || "realtor").toUpperCase()}
        />
        <EmptyState
          title="Property not found"
          description={error || "This listing may have been removed."}
          actionLabel="Back to listings"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Edit Property"
        subtitle={`Editing: ${property.title}`}
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Primary Details</Text>
        <AppInput
          label="Title *"
          value={form.title}
          onChangeText={(value) => updateField("title", value)}
          placeholder="e.g. Harbor View Duplex"
        />
        <AppInput
          label="Description *"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          placeholder="Describe property features, facilities, and options"
          multiline
          inputStyle={styles.multiline}
        />
        <AppInput
          label="Price (NGN) *"
          value={form.price}
          onChangeText={(value) => updateField("price", value)}
          placeholder="e.g. 150000000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Location & Category</Text>
        <AppInput
          label="Street Address *"
          value={form.street}
          onChangeText={(value) => updateField("street", value)}
          placeholder="e.g. 15, Admiralty Way"
        />
        <View style={styles.row}>
          <AppInput
            label="City"
            value={form.city}
            onChangeText={(value) => updateField("city", value)}
            containerStyle={styles.flexInput}
          />
          <AppInput
            label="State"
            value={form.state}
            onChangeText={(value) => updateField("state", value)}
            containerStyle={styles.flexInput}
          />
        </View>
        <View style={styles.row}>
          <AppInput
            label="Property Type"
            value={form.propertyType}
            onChangeText={(value) => updateField("propertyType", value)}
            placeholder="apartment, duplex, house, land..."
            containerStyle={styles.flexInput}
          />
          <AppInput
            label="Listing Type"
            value={form.listingType}
            onChangeText={(value) => updateField("listingType", value)}
            placeholder="sale, rent, short_let, lease"
            containerStyle={styles.flexInput}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Specifications & Features</Text>
        <View style={styles.row}>
          <AppInput
            label="Bedrooms"
            value={form.bedrooms}
            onChangeText={(value) => updateField("bedrooms", value)}
            placeholder="0"
            keyboardType="numeric"
            containerStyle={styles.flexInput}
          />
          <AppInput
            label="Bathrooms"
            value={form.bathrooms}
            onChangeText={(value) => updateField("bathrooms", value)}
            placeholder="0"
            keyboardType="numeric"
            containerStyle={styles.flexInput}
          />
        </View>
        <AppInput
          label="Area (Sq Ft)"
          value={form.areaSqFt}
          onChangeText={(value) => updateField("areaSqFt", value)}
          placeholder="e.g. 3500"
          keyboardType="numeric"
        />
        <AppInput
          label="Features (comma-separated)"
          value={form.features}
          onChangeText={(value) => updateField("features", value)}
          placeholder="e.g. Swimming Pool, Gym, Security, Generator"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Gallery Media</Text>
        <PropertyImageUploader value={images} onChange={setImages} />
      </View>

      <View style={styles.buttonGroup}>
        <PrimaryButton
          title={saving ? "Submitting for Review..." : "Submit for Approval"}
          onPress={() => handleSave(true)}
          loading={saving}
          disabled={savingDraft}
        />
        <PrimaryButton
          title={savingDraft ? "Saving..." : "Save Draft"}
          variant="secondary"
          onPress={() => handleSave(false)}
          loading={savingDraft}
          disabled={saving}
        />
        <PrimaryButton
          title="Back to Details"
          variant="ghost"
          onPress={() => router.back()}
          disabled={saving || savingDraft}
        />
      </View>
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
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flexInput: {
    flex: 1,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  buttonGroup: {
    gap: 10,
    marginTop: 8,
  },
});
