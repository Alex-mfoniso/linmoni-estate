import { StyleSheet, Text, TextInput, View } from "react-native";
import COLORS from "../constants/colors";

export default function AppInput({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  rightAccessory,
  ...inputProps
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <TextInput
          placeholderTextColor={COLORS.placeholder}
          style={[styles.input, inputStyle]}
          {...inputProps}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 54,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  accessory: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  helper: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
  },
});
