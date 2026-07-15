import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import COLORS from "../constants/colors";
import { getImageSourceFromItem, getPropertyGallery } from "../utils/propertyMedia";
import ImageErrorFallback from "./ImageErrorFallback";
import ImageLoadingPlaceholder from "./ImageLoadingPlaceholder";

function ViewerSlide({ item, width }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const source = getImageSourceFromItem(item, {
    width: 1800,
    height: 1400,
    crop: "limit",
  });

  if (failed) {
    return (
      <View style={[styles.slide, { width }]}>
        <ImageErrorFallback
          title="Image unavailable"
          description="We could not load this photo in full screen."
        />
      </View>
    );
  }

  return (
    <View style={[styles.slide, { width }]}>
      {loading ? (
        <View style={styles.loaderOverlay}>
          <ImageLoadingPlaceholder label="Loading photo..." />
        </View>
      ) : null}
      <Image
        source={{ uri: source }}
        style={[styles.image, loading ? styles.hiddenImage : null]}
        contentFit="contain"
        transition={150}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
    </View>
  );
}

export default function FullScreenImageViewer({
  visible,
  onClose,
  property,
  images: imageItems,
  initialIndex = 0,
}) {
  const screenWidth = Dimensions.get("window").width;
  const listRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);

  const images = useMemo(() => {
    if (Array.isArray(imageItems) && imageItems.length > 0) {
      return imageItems;
    }

    return getPropertyGallery(property);
  }, [imageItems, property]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setIndex(initialIndex);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex?.({
        index: Math.min(initialIndex, Math.max(images.length - 1, 0)),
        animated: false,
      });
    });
  }, [initialIndex, images.length, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {images.length ? `${index + 1}/${images.length}` : "0/0"}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, itemIndex) =>
            String(item?.id || item?.publicId || item?.secureUrl || itemIndex)
          }
          getItemLayout={(_, itemIndex) => ({
            length: screenWidth,
            offset: screenWidth * itemIndex,
            index: itemIndex,
          })}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
            );
            setIndex(nextIndex);
          }}
          renderItem={({ item }) => <ViewerSlide item={item} width={screenWidth} />}
          ListEmptyComponent={
            <ImageErrorFallback
              title="No photos"
              description="This listing does not currently have any uploaded photos."
            />
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 18, 21, 0.95)",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  slide: {
    flex: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  image: {
    flex: 1,
    width: "100%",
    minHeight: "80%",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  hiddenImage: {
    opacity: 0,
  },
});
