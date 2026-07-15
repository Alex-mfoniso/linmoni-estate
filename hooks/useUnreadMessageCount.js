import { useEffect, useState } from "react";
import { subscribeToConversations } from "../services/messageService";

export default function useUnreadMessageCount(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function start() {
      unsubscribe = await subscribeToConversations(userId, (items) => {
        if (!active) {
          return;
        }

        const nextCount = Array.isArray(items)
          ? items.reduce((total, conversation) => total + Number(conversation?.unreadCount || 0), 0)
          : 0;

        setCount(nextCount);
      });
    }

    if (userId) {
      void start();
    } else {
      setCount(0);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  return count;
}
