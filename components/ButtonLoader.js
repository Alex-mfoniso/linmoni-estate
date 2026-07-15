import { ActivityIndicator, StyleSheet, View } from "react-native";
import COLORS from "../constants/colors";

export default function ButtonLoader({ color = COLORS.white }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="small" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 18,
    minHeight: 18,
  },
});
