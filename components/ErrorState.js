import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import PrimaryButton from "./PrimaryButton";

export default function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>!</Text>
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
  card: {
    alignItems: "center",
    gap: 10,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(214, 69, 69, 0.18)",
    backgroundColor: "rgba(214, 69, 69, 0.06)",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(214, 69, 69, 0.12)",
  },
  icon: {
    color: COLORS.error,
    fontSize: 26,
    fontWeight: "900",
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
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
