import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime } from "../utils/relativeTime";

export default function NotificationPreview({
  title,
  description,
  createdAt,
  count,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {count ? <StatusBadge label={`${count}`} variant="neutral" /> : null}
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {createdAt ? <Text style={styles.time}>{formatRelativeTime(createdAt)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "700",
  },
});
