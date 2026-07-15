import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

export default function ImageErrorFallback({
  title = "Image unavailable",
  description = "We could not load this image.",
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="image-outline" size={30} color={COLORS.secondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
    gap: 8,
    padding: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
