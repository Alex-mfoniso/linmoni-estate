import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";

export default function QuickActionCard({
  title,
  description,
  icon,
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
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon || "*"}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
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
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  icon: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
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
});
