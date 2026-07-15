import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function SimpleBarChart({ data = {} }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  return (
    <View style={styles.card}>
      {entries.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(Number(value || 0) / max) * 100}%` }]} />
          </View>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    gap: 6,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.inputBackground,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  value: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
});
