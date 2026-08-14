import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import useNetworkStatus from "../hooks/useNetworkStatus";
import useReducedMotion from "../hooks/useReducedMotion";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : SlideInUp.duration(220)}
      exiting={reduceMotion ? undefined : SlideOutUp.duration(180)}
      style={[styles.banner, { top: Math.max(insets.top, 12) }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={18} color={COLORS.warning} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>You’re offline</Text>
        <Text style={styles.text}>Saved content is still available. New changes may not sync.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 40,
    borderRadius: 16,
    padding: 12,
    backgroundColor: COLORS.warningSurface,
    borderWidth: 1,
    borderColor: "rgba(154, 106, 33, 0.28)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  copy: { flex: 1 },
  title: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  text: { marginTop: 2, color: COLORS.mutedText, fontSize: 12, lineHeight: 17 },
});
