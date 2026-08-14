import { ROLES } from "../../constants/roles";
import ConversationListScreen from "../../components/ConversationListScreen";

export default function RealtorMessagesScreen() {
  return (
    <ConversationListScreen
      title="Messages"
      subtitle="Conversations from clients appear here."
      emptyTitle="No client chats yet"
      emptyDescription="When a client messages one of your listings, it will appear here."
      routePrefix="/(realtor)"
      role={ROLES.REALTOR}
      remote={true}
    />
  );
}
