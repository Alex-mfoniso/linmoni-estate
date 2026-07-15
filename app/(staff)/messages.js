import { ROLES } from "../../constants/roles";
import ConversationListScreen from "../../components/ConversationListScreen";

export default function StaffMessagesScreen() {
  return (
    <ConversationListScreen
      title="Messages"
      subtitle="Monitor and continue conversations with clients."
      emptyTitle="No conversations yet"
      emptyDescription="Client messages and follow-ups will appear here."
      routePrefix="/(staff)"
      role={ROLES.STAFF}
    />
  );
}
