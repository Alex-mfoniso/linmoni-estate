import { StyleSheet, Text } from "react-native";
import COLORS from "../constants/colors";
import PrimaryButton from "./PrimaryButton";
import AnimatedStateView from "./AnimatedStateView";
import RiveIllustration from "./RiveIllustration";

export default function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <AnimatedStateView style={styles.card}>
      <RiveIllustration
        accessibilityLabel={`An architectural illustration for ${title}`}
        style={styles.illustration}
      />
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
    </AnimatedStateView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 10,
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.errorSurface,
  },
  illustration: {
    marginBottom: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    marginTop: 6,
    alignSelf: "stretch",
  },
});
