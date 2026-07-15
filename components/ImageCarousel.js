import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import { getImageSourceFromItem, getPropertyGallery } from "../utils/propertyMedia";
import ImageErrorFallback from "./ImageErrorFallback";
import ImageLoadingPlaceholder from "./ImageLoadingPlaceholder";

function GallerySlide({ item, onPress, imageWidth, imageHeight }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const source = getImageSourceFromItem(item, {
    width: imageWidth,
    height: imageHeight,
    crop: "fill",
  });

  if (failed) {
    return (
      <Pressable onPress={onPress} style={styles.slide}>
        <ImageErrorFallback
          title="Image unavailable"
          description="This property photo could not be loaded."
        />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.imageWrap}>
      {loading ? (
        <View style={styles.loaderOverlay}>
          <ImageLoadingPlaceholder label="Loading photo..." />
        </View>
      ) : null}
      <Image
        source={{ uri: source }}
        style={[styles.image, loading ? styles.hiddenImage : null]}
        contentFit="cover"
        transition={150}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
    </Pressable>
  );
}

export default function ImageCarousel({
  property,
  images: imageItems,
  onPressImage,
}) {
  const images = useMemo(() => {
    if (Array.isArray(imageItems) && imageItems.length > 0) {
      return imageItems;
    }

    return getPropertyGallery(property);
  }, [imageItems, property]);

  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <ImageErrorFallback
        title="No photos yet"
        description="This listing does not have any uploaded property images."
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item, itemIndex) =>
          String(item?.id || item?.publicId || item?.secureUrl || itemIndex)
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(
            event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
          );
          setIndex(nextIndex);
        }}
        renderItem={({ item, index: itemIndex }) => {
          return (
            <View style={styles.slide}>
              <GallerySlide
                item={item}
                onPress={() => onPressImage?.(itemIndex)}
                imageWidth={1600}
                imageHeight={1200}
              />
              <View style={styles.overlay}>
                <View style={styles.badge}>
                  <Ionicons name="images-outline" size={14} color={COLORS.white} />
                  <Text style={styles.badgeText}>{index + 1}/{images.length}</Text>
                </View>

                {item?.isCover || itemIndex === 0 ? (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover image</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slide: {
    width: "100%",
    minHeight: 260,
  },
  imageWrap: {
    flex: 1,
    minHeight: 260,
    backgroundColor: COLORS.inputBackground,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  image: {
    width: "100%",
    minHeight: 260,
  },
  hiddenImage: {
    opacity: 0,
  },
  overlay: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(18, 39, 47, 0.84)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  coverBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(7, 102, 94, 0.84)",
  },
  coverBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
});
