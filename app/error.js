import { StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import COLORS from "../constants/colors";

export default function ErrorBoundary({ error, retry }) {
  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Something went wrong</Text>
        <Text style={styles.title}>We hit a startup error.</Text>
        <Text style={styles.message}>
          The app could not finish loading this screen. Try reloading the app.
        </Text>

        {error ? <Text style={styles.details}>{error.message}</Text> : null}

        <PrimaryButton title="Try Again" onPress={retry} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  kicker: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
  },
  message: {
    marginTop: 10,
    color: COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  details: {
    marginTop: 14,
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },
});
