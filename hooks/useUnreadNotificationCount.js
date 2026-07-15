import { useEffect, useState } from "react";
import { subscribeToUnreadCount } from "../services/notificationService";

export default function useUnreadNotificationCount(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function start() {
      unsubscribe = await subscribeToUnreadCount(userId, (nextCount) => {
        if (!active) {
          return;
        }

        setCount(Number(nextCount || 0));
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
