import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";
import StatusBadge from "./StatusBadge";

export default function InsightCard({
  title,
  description,
  value,
  badge,
  meta,
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
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {badge ? <StatusBadge label={badge} variant="neutral" /> : null}
      </View>

      {value ? <Text style={styles.value}>{value}</Text> : null}
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    minHeight: 150,
    borderRadius: 24,
    padding: 16,
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  value: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
  },
});
