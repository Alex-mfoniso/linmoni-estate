import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

export default function ScreenContainer({
  children,
  contentContainerStyle,
  scroll = true,
}) {
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: styles.scrollContent,
        keyboardShouldPersistTaps: "handled",
      }
    : {};

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Container style={styles.container} {...containerProps}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    width: "100%",
    flex: 1,
    alignSelf: "center",
    maxWidth: 920,
  },
});
