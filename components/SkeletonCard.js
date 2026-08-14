import { StyleSheet, View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";
import COLORS from "../constants/colors";

export default function SkeletonCard({ lines = 3, height = 16, variant = "text" }) {
  return (
    <View style={styles.card}>
      {variant === "media" ? <View style={styles.media} /> : null}
      <SkeletonLoader rows={lines} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: COLORS.surface,
    gap: 16,
  },
  media: {
    height: 180,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceMuted,
  },
});
