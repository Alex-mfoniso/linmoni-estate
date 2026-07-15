import { Modal, Pressable, StyleSheet, View } from "react-native";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";

export default function BottomSheet({ visible, onClose, children }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(16, 42, 67, 0.45)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.surface,
    padding: 20,
    gap: 16,
    ...SHADOWS.raised,
  },
  handle: {
    alignSelf: "center",
    width: 56,
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
});
