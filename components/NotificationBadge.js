import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function NotificationBadge({ count = 0 }) {
  if (!count) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
});
