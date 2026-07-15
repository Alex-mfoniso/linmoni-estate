import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function AnalyticsStatCard({ label, value, hint }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "48%",
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  label: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  value: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },
  hint: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
});
