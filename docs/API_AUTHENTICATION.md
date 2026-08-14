# API authentication

Base URL is `EXPO_PUBLIC_API_URL`. Protected calls send `Authorization: Bearer <Firebase ID token>`. The centralized client requests tokens from the current Firebase user, never persists or logs them, refreshes once after a 401, applies a 12-second timeout, and normalizes offline/server errors.

Endpoints:

- `GET /api/health` — public process liveness only.
- `GET /api/v1/auth/me` — verified token, existing profile, active status.
- `PATCH /api/v1/auth/me` — safe full-name/phone update for the current active profile.
- `POST /api/v1/auth/register-client-profile` — verified token; accepts only `fullName` and `phone`; creates client only.
- `PATCH /api/v1/auth/sync-email-verification` — reads only the verified token claim.
- `PATCH /api/v1/auth/complete-password-change` — clears the server flag after Firebase updates the password; no password body.
- `POST /api/v1/auth/logout-event` — best-effort trusted audit event.

Responses use `{ success, message, data }` or `{ success: false, message, code, errors }`. Raw Firebase/Mongoose errors and production stacks are never returned.
