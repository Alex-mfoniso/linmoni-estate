import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import AppInput from "../../../components/AppInput";
import PrimaryButton from "../../../components/PrimaryButton";
import PropertyImageUploader from "../../../components/PropertyImageUploader";
import ScreenContainer from "../../../components/ScreenContainer";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadMultipleImages } from "../../../services/cloudinaryService";
import { createProperty } from "../../../services/propertyService";
import {
  isLocalImageItem,
  preparePropertyImagesForSave,
} from "../../../utils/propertyMedia";

const DEFAULT_FORM = {
  title: "",
  description: "",
  price: "",
  address: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  status: "available",
};

function isValidNumber(value) {
  if (value === "" || value === null || typeof value === "undefined") {
    return true;
  }

  return Number.isFinite(Number(value));
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    if (saving) {
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.price.trim()) {
      Alert.alert("Missing details", "Please complete the required property fields.");
      return;
    }

    if (
      !isValidNumber(form.price) ||
      !isValidNumber(form.bedrooms) ||
      !isValidNumber(form.bathrooms)
    ) {
      Alert.alert("Invalid input", "Please enter valid numeric values for price and rooms.");
      return;
    }

    setSaving(true);

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

      const payload = preparePropertyImagesForSave(finalizedItems);

      const property = await createProperty({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        address: form.address.trim(),
        propertyType: form.propertyType.trim(),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        status: form.status.trim(),
        createdBy: currentUser?.uid || "",
        ...payload,
      });

      router.replace(`/(realtor)/properties/${property.id}`);
    } catch (error) {
      Alert.alert("Create property", error?.message || "Unable to create this property.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Add Property"
        subtitle="Create a new listing and upload property photos."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Property details</Text>
        <AppInput
          label="Title"
          value={form.title}
          onChangeText={(value) => updateField("title", value)}
          placeholder="e.g. Harbor View Homes"
        />
        <AppInput
          label="Description"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          placeholder="Describe the property"
          multiline
          inputStyle={styles.multiline}
        />
        <AppInput
          label="Price"
          value={form.price}
          onChangeText={(value) => updateField("price", value)}
          placeholder="e.g. 85000000"
          keyboardType="numeric"
        />
        <AppInput
          label="Address"
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
          placeholder="Property address"
        />
        <AppInput
          label="Property type"
          value={form.propertyType}
          onChangeText={(value) => updateField("propertyType", value)}
          placeholder="Duplex, Apartment, Land..."
        />
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Images</Text>
        <PropertyImageUploader value={images} onChange={setImages} />
      </View>

      <PrimaryButton
        title={saving ? "Creating..." : "Create property"}
        onPress={handleSubmit}
        loading={saving}
      />
      <PrimaryButton title="Back to properties" variant="ghost" onPress={() => router.back()} />
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
});
