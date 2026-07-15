import { FlatList, StyleSheet, View } from "react-native";
import NotificationCard from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";

export default function NotificationList({
  notifications = [],
  onMarkRead,
  onDelete,
  onOpen,
  refreshing = false,
  onRefresh,
}) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <NotificationCard
          notification={item}
          onPress={() => onOpen?.(item)}
          onMarkRead={() => onMarkRead?.(item)}
          onDelete={() => onDelete?.(item)}
        />
      )}
      ListEmptyComponent={
        <NotificationEmptyState
          title="No notifications"
          description="New activity will appear here."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 12,
    gap: 10,
  },
  separator: {
    height: 0,
  },
});
