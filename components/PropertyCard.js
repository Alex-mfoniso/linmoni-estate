import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import COLORS from "../constants/colors";
import StatusBadge from "./StatusBadge";
import { SHADOWS } from "../constants/theme";
import { getPropertyCoverUri, getPropertyGallery } from "../utils/propertyMedia";
import { formatListingPrice } from "../utils/formatCurrency";

function getFeatureValue(value, suffix) {
  const numeric = Number(value || 0);
  return `${numeric}${suffix}`;
}

export default function PropertyCard({
  property,
  onView,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
  tertiaryActionLabel,
  onTertiaryAction,
  onFavoriteToggle,
  isFavorited = false,
}) {
  const bedrooms = Number(property?.bedrooms || 0);
  const bathrooms = Number(property?.bathrooms || 0);
  const imageUrl = getPropertyCoverUri(property, {
    width: 1200,
    height: 900,
    crop: "fill",
  });
  const typeLabel = (property?.propertyType || "Property").slice(0, 2).toUpperCase();
  const status = String(property?.status || "available").toLowerCase();
  const galleryCount = getPropertyGallery(property).length;

  return (
    <View style={styles.card}>
      <View style={styles.media}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`${property?.id || "property"}:${imageUrl}`}
            transition={220}
            accessibilityLabel={`Photo of ${property?.title || "property"}`}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="business-outline" size={34} color={COLORS.primary} />
          </View>
        )}
        <View style={styles.mediaOverlay}>
          <View style={styles.badgeRow}>
            <StatusBadge label={typeLabel} variant="neutral" />
            {galleryCount > 1 ? (
              <View style={styles.countBadge}>
                <Ionicons name="images-outline" size={12} color={COLORS.white} />
                <Text style={styles.countBadgeText}>{galleryCount}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.mediaRow}>
            {onFavoriteToggle ? (
              <Pressable
                onPress={onFavoriteToggle}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={isFavorited ? "Remove from saved properties" : "Save property"}
                accessibilityState={{ selected: isFavorited }}
              >
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={18}
                  color={isFavorited ? COLORS.error : COLORS.primary}
                />
              </Pressable>
            ) : (
              <View />
            )}
            <StatusBadge label={status} variant="subtle" />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {property?.title || "Untitled property"}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property?.location || property?.address || [property?.city, property?.state].filter(Boolean).join(", ") || "Location unavailable"}
          </Text>
        </View>

        <Text style={styles.price}>{formatListingPrice(property)}</Text>

        <View style={styles.featureRow}>
          <View style={styles.featurePill}>
            <Text style={styles.featureValue}>{getFeatureValue(bedrooms, " bd")}</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featureValue}>{getFeatureValue(bathrooms, " ba")}</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featureValue}>{property?.propertyType || "Property"}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {property?.description || "No description available yet."}
        </Text>

        {onView || onPrimaryAction || onSecondaryAction || onTertiaryAction ? (
          <View style={styles.actions}>
            {onView ? (
              <Pressable onPress={onView} style={styles.actionPrimary} accessibilityRole="button" accessibilityLabel={`View ${property?.title || "property"}`}>
                <Text style={styles.actionPrimaryText}>View</Text>
              </Pressable>
            ) : null}

            {onPrimaryAction ? (
              <Pressable onPress={onPrimaryAction} style={styles.actionSecondary}>
                <Text style={styles.actionSecondaryText}>
                  {primaryActionLabel || "Action"}
                </Text>
              </Pressable>
            ) : null}

            {onSecondaryAction ? (
              <Pressable onPress={onSecondaryAction} style={styles.actionGhost}>
                <Text style={styles.actionGhostText}>
                  {secondaryActionLabel || "More"}
                </Text>
              </Pressable>
            ) : null}

            {onTertiaryAction ? (
              <Pressable onPress={onTertiaryAction} style={styles.actionGhost}>
                <Text style={styles.actionGhostText}>
                  {tertiaryActionLabel || "Option"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  media: {
    minHeight: 210,
    backgroundColor: COLORS.softPrimary,
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: 210,
  },
  imageFallback: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  mediaOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 14,
    gap: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(18, 39, 47, 0.84)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  body: {
    padding: 18,
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    flex: 1,
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "600",
  },
  price: {
    color: COLORS.primary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featurePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionPrimary: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
  },
  actionPrimaryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  actionSecondary: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionSecondaryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  actionGhost: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionGhostText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
