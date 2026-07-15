import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function InlineLoader({ label = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "600",
  },
});
