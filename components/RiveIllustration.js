import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

const DEFAULT_FALLBACK = require("../assets/illustrations/architectural-state.png");

export default function RiveIllustration({
  accessibilityLabel,
  fallbackSource = DEFAULT_FALLBACK,
  RiveComponent,
  riveProps,
  style,
}) {
  return (
    <View
      style={[styles.frame, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {RiveComponent ? (
        <RiveComponent {...riveProps} style={styles.media} />
      ) : (
        <Image source={fallbackSource} style={styles.media} contentFit="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 176,
    height: 148,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});
