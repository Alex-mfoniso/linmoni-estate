import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import { createLocalImageItem } from "../utils/propertyMedia";
import { validateImage } from "../services/cloudinaryService";
import SelectedImagePreview from "./SelectedImagePreview";

function isSameImage(left, right) {
  return (
    (left?.id && left.id === right?.id) ||
    (left?.uri && left.uri === right?.uri) ||
    (left?.secureUrl && left.secureUrl === right?.secureUrl) ||
    (left?.publicId && left.publicId === right?.publicId)
  );
}

function ensureCover(nextItems) {
  if (!nextItems.length) {
    return nextItems;
  }

  if (!nextItems.some((item) => item.isCover)) {
    return nextItems.map((item, index) => ({
      ...item,
      isCover: index === 0,
    }));
  }

  return nextItems;
}

function moveItem(items, fromIndex, toIndex) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return ensureCover(next);
}

export default function PropertyImageUploader({
  label = "Property images",
  helperText = "Upload one or more images. The first image becomes the default cover unless you choose another one.",
  value = [],
  onChange,
  disabled = false,
  maxImages = 12,
}) {
  const [picking, setPicking] = useState(false);

  async function handlePickImages() {
    if (disabled || picking) {
      return;
    }

    setPicking(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "We need media library access so you can pick property images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        quality: 0.9,
      });

      if (result.canceled || !Array.isArray(result.assets)) {
        return;
      }

      const pickedItems = result.assets
        .map((asset) => {
          const normalized = validateImage(asset);
          return createLocalImageItem(normalized);
        })
        .filter(Boolean);

      if (!pickedItems.length) {
        return;
      }

      const merged = [...value];

      for (const item of pickedItems) {
        const duplicate = merged.some((existing) => isSameImage(existing, item));
        if (!duplicate) {
          merged.push(item);
        }
      }

      onChange?.(ensureCover(merged).slice(0, maxImages));
    } catch (error) {
      Alert.alert("Image picker", error?.message || "Unable to select images.");
    } finally {
      setPicking(false);
    }
  }

  function handleRemove(item) {
    const nextItems = value.filter((current) => !isSameImage(current, item));
    onChange?.(ensureCover(nextItems));
  }

  function handleSetCover(item) {
    onChange?.(
      value.map((current) => ({
        ...current,
        isCover: isSameImage(current, item),
      }))
    );
  }

  function handleMoveUp(item) {
    const index = value.findIndex((current) => isSameImage(current, item));
    if (index < 0) {
      return;
    }
    onChange?.(moveItem(value, index, index - 1));
  }

  function handleMoveDown(item) {
    const index = value.findIndex((current) => isSameImage(current, item));
    if (index < 0) {
      return;
    }
    onChange?.(moveItem(value, index, index + 1));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.helper}>{helperText}</Text>
        </View>

        <Pressable onPress={handlePickImages} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.addButtonText}>{picking ? "Adding..." : "Add images"}</Text>
        </Pressable>
      </View>

      {value.length ? (
        <View style={styles.grid}>
          {value.map((item, index) => (
            <SelectedImagePreview
              key={item.id || item.publicId || item.uri || `${index}`}
              item={item}
              index={index}
              isCover={Boolean(item.isCover) || index === 0}
              canMoveUp={index > 0}
              canMoveDown={index < value.length - 1}
              onRemove={handleRemove}
              onSetCover={handleSetCover}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    gap: 12,
  },
  titleWrap: {
    gap: 6,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  helper: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  addButton: {
    minHeight: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  grid: {
    gap: 14,
  },
});
