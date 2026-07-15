import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";

export default function UpcomingCard({
  title,
  description,
  dateLabel,
  timeLabel,
  badge,
  actionLabel,
  route,
  onPress,
}) {
  const router = useRouter();
  const handlePress = onPress || (route ? () => router.push(route) : undefined);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.topRow}>
        <Text style={styles.kicker}>Upcoming</Text>
        {badge ? <StatusBadge label={badge} variant="neutral" /> : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{dateLabel}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>Time</Text>
          <Text style={styles.metaValue}>{timeLabel}</Text>
        </View>
      </View>

      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  kicker: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaPill: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  metaLabel: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  action: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});
