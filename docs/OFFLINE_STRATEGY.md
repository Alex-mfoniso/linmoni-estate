# Offline and request strategy

Client business records are server authoritative. Phase C does not persist writable favourites, bookings, conversations, messages, notifications, or property catalogues in AsyncStorage.

Requests have a 12-second default timeout, support caller cancellation, cancel on logout, and retry authentication once after a refreshable 401. Property search waits 350 ms and cancels superseded requests. UI surfaces actionable loading, empty, timeout, network, and service errors. Existing Expo image memory/disk caching provides media resilience, but stale business responses are not silently presented as current.
