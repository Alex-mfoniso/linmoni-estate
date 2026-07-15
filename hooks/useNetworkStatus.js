import { useEffect, useState } from "react";

const CHECK_URL = "https://clients3.google.com/generate_204";

async function pingNetwork() {
  try {
    await fetch(CHECK_URL, {
      method: "GET",
      cache: "no-store",
      headers: {
        "cache-control": "no-cache",
      },
    });
    return true;
  } catch {
    return false;
  }
}

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let active = true;
    let timer = null;

    async function updateStatus() {
      const browserOnline =
        typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
          ? navigator.onLine
          : true;

      const reachable = await pingNetwork();
      if (active) {
        setIsOnline(browserOnline && reachable);
      }
    }

    updateStatus();
    timer = setInterval(updateStatus, 30000);

    function handleOnline() {
      if (active) {
        setIsOnline(true);
      }
    }

    function handleOffline() {
      if (active) {
        setIsOnline(false);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  return isOnline;
}
