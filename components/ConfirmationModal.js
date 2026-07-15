import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import { SHADOWS } from "../constants/theme";

export default function ConfirmationModal({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconWrap, destructive ? styles.iconWrapDanger : null]}>
            <Text style={[styles.icon, destructive ? styles.iconDanger : null]}>
              {destructive ? "!" : "i"}
            </Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          <View style={styles.actions}>
            <SecondaryButton
              title={cancelLabel}
              onPress={onCancel}
              containerStyle={styles.actionButton}
            />
            <PrimaryButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? "danger" : "primary"}
              containerStyle={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 42, 67, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 14,
    ...SHADOWS.raised,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  iconWrapDanger: {
    backgroundColor: "rgba(214, 69, 69, 0.12)",
  },
  icon: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  iconDanger: {
    color: COLORS.error,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
  },
});
