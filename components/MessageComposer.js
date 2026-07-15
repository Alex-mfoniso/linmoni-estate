import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

export default function MessageComposer({
  value,
  onChangeText,
  onSend,
  disabled = false,
  sending = false,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Write a message..."
        placeholderTextColor={COLORS.placeholder}
        multiline
        maxLength={1000}
        style={styles.input}
        editable={!disabled && !sending}
      />
      <View style={styles.footer}>
        <Text style={styles.counter}>{Math.min(String(value || "").length, 1000)}/1000</Text>
        <Pressable
          onPress={onSend}
          disabled={disabled || sending}
          style={({ pressed }) => [
            styles.sendButton,
            (disabled || sending) && styles.sendButtonDisabled,
            pressed && !(disabled || sending) && styles.sendButtonPressed,
          ]}
        >
          <Ionicons name="send" size={16} color={COLORS.white} />
          <Text style={styles.sendText}>{sending ? "Sending..." : "Send"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 14,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    minHeight: 96,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  counter: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  sendButton: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonPressed: {
    opacity: 0.92,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
