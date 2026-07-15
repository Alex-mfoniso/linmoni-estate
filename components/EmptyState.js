import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import PrimaryButton from "./PrimaryButton";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap} accessibilityRole="image" accessibilityLabel={title}>
        <Ionicons name="folder-open-outline" size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel ? (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          containerStyle={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    color: COLORS.mutedText,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 18,
    alignSelf: "stretch",
  },
});
