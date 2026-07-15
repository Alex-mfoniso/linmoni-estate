import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import useNetworkStatus from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.left}>
        <Ionicons name="cloud-offline-outline" size={18} color={COLORS.error} />
        <Text style={styles.text}>You are offline. Some actions are disabled.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 50,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(214, 69, 69, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(214, 69, 69, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
});
