import { StyleSheet, View } from "react-native";
import ScreenContainer from "./ScreenContainer";
import AppHeader from "./AppHeader";
import EmptyState from "./EmptyState";
import COLORS from "../constants/colors";

export default function PlaceholderScreen({
  title,
  subtitle,
  userName,
  role,
  notificationCount = 0,
  onNotificationPress,
  actionLabel,
  onAction,
  emptyTitle,
  emptyDescription,
}) {
  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={userName}
        role={role}
        notificationCount={notificationCount}
        onNotificationPress={onNotificationPress}
      />

      <View style={styles.panel}>
        <EmptyState
          title={emptyTitle || title}
          description={
            emptyDescription ||
            "This section is ready for a future phase and stays intentionally simple for now."
          }
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  panel: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
});
