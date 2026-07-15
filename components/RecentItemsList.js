import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import { formatRelativeTime } from "../utils/relativeTime";

export default function RecentItemsList({ items = [] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.row}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{item.icon || "*"}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.title}>{item.title}</Text>
              {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            </View>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            {item.createdAt ? <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
});
