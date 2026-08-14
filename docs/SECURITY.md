# Security

The server uses Helmet, exact-origin CORS (origin-less native calls are allowed), 100 KB body limits, general and auth-write rate limits, Zod strict validation, Firebase Admin token verification with revocation checking, MongoDB status/role authority, Pino redaction, normalized errors, and graceful shutdown.

Never store or log passwords or Firebase tokens. Never put Firebase Admin or MongoDB credentials in Expo. Never trust UID, email, verification, role, or status from request input. Client guards improve navigation only; every protected server operation must apply authentication, profile, active-account, then role middleware.

Phase B intentionally defers business-operation authorization. Local admin lists and demo data may render, but local internal-user creation and invitation acceptance are blocked and must not be presented as production-secure.
