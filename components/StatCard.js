import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";

export default function StatCard({ label, value, hint }) {
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
    flex: 1,
    minWidth: 150,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    ...SHADOWS.card,
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  value: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },
  hint: {
    marginTop: 6,
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
