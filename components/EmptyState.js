import { StyleSheet, Text } from "react-native";
import COLORS from "../constants/colors";
import PrimaryButton from "./PrimaryButton";
import AnimatedStateView from "./AnimatedStateView";
import RiveIllustration from "./RiveIllustration";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustrationLabel,
}) {
  return (
    <AnimatedStateView style={styles.container}>
      <RiveIllustration
        accessibilityLabel={illustrationLabel || `An architectural illustration for ${title}`}
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
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.inputBackground,
  },
  illustration: {
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
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
