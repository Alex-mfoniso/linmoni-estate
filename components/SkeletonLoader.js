import { StyleSheet, View } from "react-native";
import COLORS from "../constants/colors";

export default function SkeletonLoader({ rows = 1, height = 18 }) {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.line,
            { height, width: `${90 - index * 12}%` },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  line: {
    borderRadius: 999,
    backgroundColor: "rgba(159, 179, 200, 0.25)",
    overflow: "hidden",
  },
});
