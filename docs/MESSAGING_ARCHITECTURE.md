# Messaging architecture

A `Conversation` binds one property, one Client, and its Realtor; a unique compound index prevents duplicates. `Message` stores the conversation, server-derived sender, text/type, read receipts, and timestamps.

- `GET|POST /api/v1/conversations`
- `GET|POST /api/v1/conversations/:id/messages`
- `PATCH /api/v1/conversations/:id/read`
- `GET /api/v1/conversations/unread-count`

Membership is checked on every operation. Client-supplied participant or sender identifiers are rejected by strict validators. Phase C uses authenticated HTTP reads/writes and optimistic sending. It does not advertise realtime delivery; lists refresh when opened.
