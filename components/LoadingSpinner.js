import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  label: {
    marginTop: 12,
    color: COLORS.mutedText,
    fontSize: 14,
    textAlign: "center",
  },
});
