import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime } from "../utils/relativeTime";

export default function ActivityCard({
  icon,
  title,
  description,
  createdAt,
  status,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon || "*"}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {status ? <StatusBadge label={status} variant="subtle" /> : null}
        </View>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {createdAt ? <Text style={styles.time}>{formatRelativeTime(createdAt)}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  left: {
    paddingTop: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  icon: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    lineHeight: 19,
  },
  time: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
  },
});
