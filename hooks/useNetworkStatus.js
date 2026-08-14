import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { getEnvironmentConfig } from "../constants/environment";

const PROBE_INTERVAL_MS = 30000;
const PROBE_TIMEOUT_MS = 6000;

function getBrowserStatus() {
  return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
    ? navigator.onLine
    : true;
}

async function probeBackend(url) {
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    await fetch(url, { method: "HEAD", signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(getBrowserStatus);

  useEffect(() => {
    let mounted = true;
    let timer;
    const backendUrl = getEnvironmentConfig().backendApiUrl;

    async function refresh() {
      const browserOnline = getBrowserStatus();
      if (!browserOnline) {
        if (mounted) setIsOnline(false);
        return;
      }

      const reachable = Platform.OS === "web" ? null : await probeBackend(backendUrl);
      if (mounted) setIsOnline(reachable ?? browserOnline);
    }

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });

    function handleOffline() {
      if (mounted) setIsOnline(false);
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("online", refresh);
      window.addEventListener("offline", handleOffline);
    }

    void refresh();
    timer = setInterval(refresh, PROBE_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(timer);
      appStateSubscription.remove();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("online", refresh);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  return isOnline;
}
