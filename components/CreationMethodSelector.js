import { Pressable, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";

const OPTIONS = [
  {
    key: "direct",
    title: "Direct Account",
    description: "Create the internal user immediately with a temporary password.",
  },
  {
    key: "invitation",
    title: "Email Invitation",
    description: "Generate a single-use invite link and let the user set a password.",
  },
];

export default function CreationMethodSelector({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      {OPTIONS.map((option) => {
        const active = value === option.key;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.card,
              active ? styles.cardActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.title, active ? styles.titleActive : null]}>
              {option.title}
            </Text>
            <Text style={[styles.description, active ? styles.descriptionActive : null]}>
              {option.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 150,
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    ...SHADOWS.card,
  },
  cardActive: {
    backgroundColor: COLORS.softPrimary,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.95,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  titleActive: {
    color: COLORS.primary,
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  descriptionActive: {
    color: COLORS.primary,
  },
});
