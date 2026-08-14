# System architecture

```text
Expo app -> Firebase Auth client -> Firebase ID token -> Express API
         -> Firebase Admin verification -> MongoDB User profile -> role/status decision
```

The Expo app connects to Firebase Auth and the Express API; it never connects to MongoDB. The Firebase client API key remains in `EXPO_PUBLIC_*` configuration because it identifies the Firebase project and is not an Admin credential. Firebase security relies on Auth configuration and server-side token verification.

Firebase Admin service-account values and `MONGODB_URI` exist only in `server/.env`. They must never be placed in Expo extras, mobile source, logs, or committed files.

Phase B is deliberately mixed: identity/profile authorization is remote and authoritative, while the recovered business modules remain local demo implementations. Every future protected Express business route must repeat token, profile, status, and role enforcement; mobile guards are a UX boundary only.
