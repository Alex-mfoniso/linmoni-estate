import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function ActivityItem({ title, description, createdAt }) {
  return (
    <View style={styles.card}>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {createdAt ? <Text style={styles.time}>{new Date(createdAt).toLocaleString()}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    marginTop: 6,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
  },
  time: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "700",
  },
});
