import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function ImageLoadingPlaceholder({ label = "Loading image..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={COLORS.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    borderRadius: 24,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  text: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
});
