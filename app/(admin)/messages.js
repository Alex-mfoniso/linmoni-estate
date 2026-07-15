import { ROLES } from "../../constants/roles";
import ConversationListScreen from "../../components/ConversationListScreen";

export default function AdminMessagesScreen() {
  return (
    <ConversationListScreen
      title="Messages"
      subtitle="Keep an eye on client conversations."
      emptyTitle="No conversations yet"
      emptyDescription="Messages will appear here when chats are started from property listings."
      routePrefix="/(admin)"
      role={ROLES.ADMIN}
    />
  );
}
