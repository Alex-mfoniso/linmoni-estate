import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function EmptyDashboard({ title, description }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 18,
    gap: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
});
