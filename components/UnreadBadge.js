import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

export default function UnreadBadge({ count = 0 }) {
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
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
});
