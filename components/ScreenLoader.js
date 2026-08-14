import { StyleSheet, View } from "react-native";
import SkeletonCard from "./SkeletonCard";

export default function ScreenLoader({ count = 3 }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Loading content">
      <SkeletonCard variant="media" />
      {Array.from({ length: Math.max(0, count - 1) }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 20 },
});
