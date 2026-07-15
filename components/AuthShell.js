import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import { SHADOWS } from "../constants/theme";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backdropTop} />
        <View style={styles.backdropBottom} />
        <View style={styles.card}>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>LINPAL Premium Estates</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.children}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  backdropTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(15, 76, 92, 0.12)",
  },
  backdropBottom: {
    position: "absolute",
    bottom: -120,
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(200, 169, 81, 0.12)",
  },
  card: {
    gap: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.raised,
  },
  brandPill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.softPrimary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandPillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  children: {
    gap: 14,
  },
  footer: {
    gap: 12,
  },
});
