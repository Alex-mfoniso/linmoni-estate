import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Lowest price", value: "price-asc" },
  { label: "Highest price", value: "price-desc" },
  { label: "A-Z", value: "title-asc" },
  { label: "Z-A", value: "title-desc" },
];

export default function SortBottomSheet({ visible, value, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Sort listings</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={18} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.list}>
            {SORT_OPTIONS.map((option) => {
              const active = value === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={[styles.option, active ? styles.optionActive : null]}
                >
                  <Text style={[styles.optionLabel, active ? styles.optionLabelActive : null]}>
                    {option.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 17, 20, 0.38)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  list: {
    gap: 10,
  },
  option: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    backgroundColor: COLORS.softPrimary,
    borderColor: COLORS.primary,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  optionLabelActive: {
    color: COLORS.primary,
  },
});
