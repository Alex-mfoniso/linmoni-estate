import { ROLES } from "../../constants/roles";
import ConversationListScreen from "../../components/ConversationListScreen";

export default function ClientMessagesScreen() {
  return (
    <ConversationListScreen
      title="Messages"
      subtitle="Chat with the realtor tied to each property."
      emptyTitle="No conversations yet"
      emptyDescription="Open a property and tap message realtor to start a conversation."
      emptyActionLabel="Browse properties"
      emptyActionRoute="/(client)/properties"
      routePrefix="/(client)"
      role={ROLES.CLIENT}
      remote
    />
  );
}
