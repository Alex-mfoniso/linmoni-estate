import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function SimpleDonutChart({ data = {} }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) || 1;

  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        <View style={styles.ring}>
          <Text style={styles.ringText}>{total}</Text>
        </View>
      </View>
      <View style={styles.list}>
        {entries.map(([label, value]) => (
          <View key={label} style={styles.item}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summary: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 10,
    borderColor: COLORS.softPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  ringText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  list: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 13,
    textTransform: "capitalize",
  },
  value: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
