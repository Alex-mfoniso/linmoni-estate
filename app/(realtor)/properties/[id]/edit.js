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
import { getPropertyById, updateProperty } from "../../../../services/propertyService";
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
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    status: "available",
  });
  const [images, setImages] = useState([]);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const item = await getPropertyById(String(params.id || ""));
        if (!item) {
          throw new Error("Property not found.");
        }

        if (active) {
          setProperty(item);
          setForm({
            title: item.title || "",
            description: item.description || "",
            price: String(item.price ?? ""),
            address: item.address || "",
            propertyType: item.propertyType || "",
            bedrooms: String(item.bedrooms ?? ""),
            bathrooms: String(item.bathrooms ?? ""),
            status: item.status || "available",
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

  async function handleSubmit() {
    if (saving || !property) {
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

      const updated = await updateProperty(property.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        address: form.address.trim(),
        propertyType: form.propertyType.trim(),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        status: form.status.trim(),
        ...payload,
      });

      router.replace(`/(realtor)/properties/${updated.id}`);
    } catch (err) {
      Alert.alert("Save property", err?.message || "Unable to update this property.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading property..." />;
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
        subtitle="Update the listing details and uploaded property photos."
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
        <AppInput
          label="Status"
          value={form.status}
          onChangeText={(value) => updateField("status", value)}
          placeholder="available, rented, sold, draft"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Images</Text>
        <PropertyImageUploader value={images} onChange={setImages} />
      </View>

      <PrimaryButton
        title={saving ? "Saving..." : "Save changes"}
        onPress={handleSubmit}
        loading={saving}
      />
      <PrimaryButton title="Back to details" variant="ghost" onPress={() => router.back()} />
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
