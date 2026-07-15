import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

const VARIANTS = {
  neutral: { backgroundColor: COLORS.softPrimary, color: COLORS.primary },
  success: { backgroundColor: "rgba(34, 139, 91, 0.12)", color: COLORS.success },
  warning: { backgroundColor: "rgba(200, 169, 81, 0.16)", color: "#8A6A14" },
  danger: { backgroundColor: "rgba(214, 69, 69, 0.12)", color: COLORS.error },
  subtle: { backgroundColor: COLORS.inputBackground, color: COLORS.mutedText },
};

export default function StatusBadge({ label, variant = "neutral" }) {
  const style = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
