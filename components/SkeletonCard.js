import { StyleSheet, View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";
import COLORS from "../constants/colors";

export default function SkeletonCard({ lines = 3, height = 16 }) {
  return (
    <View style={styles.card}>
      <SkeletonLoader rows={lines} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
