import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  onClear,
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={COLORS.placeholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        style={styles.input}
        autoCapitalize="none"
      />
      {value && onClear ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={COLORS.placeholder} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 54,
    color: COLORS.text,
    fontSize: 15,
  },
  clearButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
