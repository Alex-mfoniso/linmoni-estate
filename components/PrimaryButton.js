import { Pressable, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import ButtonLoader from "./ButtonLoader";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  containerStyle,
}) {
  const isDisabled = disabled || loading;
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondary : null,
        isGhost ? styles.ghost : null,
        isDanger ? styles.danger : null,
        !isSecondary && !isGhost && !isDanger ? styles.primary : null,
        containerStyle,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ButtonLoader color={isSecondary || isGhost ? COLORS.primary : COLORS.white} />
        ) : null}
        <Text
          style={[
            styles.title,
            isSecondary || isGhost ? styles.secondaryTitle : null,
            isDanger ? styles.dangerTitle : null,
            !isSecondary && !isGhost && !isDanger ? styles.primaryTitle : null,
            loading ? styles.titleWithSpinner : null,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.softPrimary,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.border,
  },
  danger: {
    backgroundColor: "rgba(214, 69, 69, 0.08)",
    borderColor: "rgba(214, 69, 69, 0.18)",
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryTitle: {
    color: COLORS.white,
  },
  secondaryTitle: {
    color: COLORS.primary,
  },
  dangerTitle: {
    color: COLORS.error,
  },
  titleWithSpinner: {
    marginLeft: 10,
  },
});
