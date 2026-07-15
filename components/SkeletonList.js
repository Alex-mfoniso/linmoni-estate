import { StyleSheet, View } from "react-native";
import SkeletonCard from "./SkeletonCard";

export default function SkeletonList({ count = 3 }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
});
