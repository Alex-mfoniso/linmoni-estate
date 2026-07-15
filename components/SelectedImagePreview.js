import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import COLORS from "../constants/colors";
import { getImageSourceFromItem } from "../utils/propertyMedia";

export default function SelectedImagePreview({
  item,
  index,
  isCover = false,
  canMoveUp = false,
  canMoveDown = false,
  onRemove,
  onSetCover,
  onMoveUp,
  onMoveDown,
}) {
  const source = getImageSourceFromItem(item, {
    width: 640,
    height: 480,
    crop: "fill",
  });

  return (
    <View style={styles.card}>
      <View style={styles.media}>
        <Image source={{ uri: source }} style={styles.image} contentFit="cover" />
        <View style={styles.overlay}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{isCover ? "Cover" : `Photo ${index + 1}`}</Text>
          </View>
          {item?.sourceType === "local" ? (
            <View style={[styles.tag, styles.localTag]}>
              <Text style={styles.tagText}>Local</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.label} numberOfLines={1}>
          {item?.fileName || item?.secureUrl?.split("/").pop() || "Selected image"}
        </Text>

        <View style={styles.actions}>
          <Pressable onPress={() => onSetCover?.(item)} style={styles.action}>
            <Ionicons name={isCover ? "star" : "star-outline"} size={16} color={COLORS.primary} />
          </Pressable>
          <Pressable onPress={() => onMoveUp?.(item)} style={styles.action} disabled={!canMoveUp}>
            <Ionicons
              name="arrow-up"
              size={16}
              color={canMoveUp ? COLORS.text : COLORS.placeholder}
            />
          </Pressable>
          <Pressable onPress={() => onMoveDown?.(item)} style={styles.action} disabled={!canMoveDown}>
            <Ionicons
              name="arrow-down"
              size={16}
              color={canMoveDown ? COLORS.text : COLORS.placeholder}
            />
          </Pressable>
          <Pressable onPress={() => onRemove?.(item)} style={[styles.action, styles.dangerAction]}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  media: {
    minHeight: 160,
    backgroundColor: COLORS.inputBackground,
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: 160,
  },
  overlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(18, 39, 47, 0.84)",
  },
  localTag: {
    backgroundColor: "rgba(7, 102, 94, 0.84)",
  },
  tagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  body: {
    padding: 12,
    gap: 10,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  action: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dangerAction: {
    backgroundColor: "rgba(214, 69, 69, 0.08)",
  },
});
