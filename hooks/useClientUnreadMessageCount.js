import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { conversationApi } from "../services/conversationApi";

export default function useClientUnreadMessageCount() {
  const [count, setCount] = useState(0);
  const load = useCallback(async () => {
    try {
      const result = await conversationApi.unreadCount();
      setCount(Number(result?.count || 0));
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));
  return count;
}
