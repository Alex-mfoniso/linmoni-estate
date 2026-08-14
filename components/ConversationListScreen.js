import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import ConversationCard from "./ConversationCard";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";
import ScreenContainer from "./ScreenContainer";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToConversations } from "../services/messageService";
import { conversationApi } from "../services/conversationApi";
import { realtorApi } from "../services/realtorApi";

export default function ConversationListScreen({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionRoute,
  routePrefix,
  remote = false,
  role,
}) {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function start() {
      setLoading(true);
      setError("");

      try {
        if (remote) {
          const isRealtor = role === "realtor" || routePrefix?.includes("realtor");
          const result = isRealtor
            ? await realtorApi.getConversations({ page: 1, limit: 50 })
            : await conversationApi.list({ page: 1, limit: 50 });

          if (active) {
            setConversations((result.items || []).map((item) => ({
              ...item,
              partnerProfile: isRealtor ? item.client : item.realtor,
              propertyTitle: item.property?.title,
              lastMessage: item.lastMessageText,
            })));
            setLoading(false);
          }
          return;
        }
        unsubscribe = await subscribeToConversations(currentUser?.uid, (items) => {
          if (!active) {
            return;
          }

          setConversations(Array.isArray(items) ? items : []);
          setLoading(false);
        });
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load conversations.");
          setLoading(false);
        }
      }
    }

    void start();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [currentUser?.uid, remote]);

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={currentUser?.displayName || userProfile?.fullName || "Member"}
        role={(userProfile?.role || "").toUpperCase()}
      />

      {loading ? <LoadingSpinner label="Loading conversations..." /> : null}

      {!loading && error ? (
        <EmptyState title="Could not load messages" description={error} />
      ) : null}

      {!loading && !error ? (
        <FlatList
          style={styles.listView}
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              currentUserId={currentUser?.uid}
              onPress={() => router.push(`${routePrefix}/messages/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                actionLabel={emptyActionLabel}
                onAction={emptyActionRoute ? () => router.push(emptyActionRoute) : undefined}
              />
            </View>
          }
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  list: {
    gap: 12,
    paddingBottom: 12,
  },
  listView: {
    flex: 1,
  },
  separator: {
    height: 0,
  },
  emptyWrap: {
    gap: 12,
  },
});
