# LINPAL Premium Estates

Expo SDK 57 React Native real-estate application for clients, realtors, staff, stakeholders, and administrators.

Phase B uses Firebase Authentication for credentials and sessions, an Express API for token verification, and MongoDB profiles for role and account-status authority. Property, booking, messaging, notification, analytics, and other recovered business records remain local demo modules until a later phase.

## Run locally

1. Copy `.env.example` to `.env` and fill only public Expo client configuration, including `EXPO_PUBLIC_API_URL`.
2. Install mobile dependencies with `npm install`.
3. Start Metro with `npx expo start`.
4. Use `npm run android`, `npm run ios`, or `npm run web` for a target platform.

The identity API lives in `server/`, requires Node.js 22+, and has separate private environment configuration. See `docs/ENVIRONMENT_SETUP.md` and `server/README.md`. Never put MongoDB credentials, Firebase Admin credentials, Cloudinary API secrets, passwords, or bearer tokens in Expo public variables.

## Project guides

- `docs/PHASE_A_REPORT.md`: recovered-project architecture and design audit.
- `docs/PHASE_B_MIGRATION.md`: identity migration scope and compatibility boundary.
- `docs/SYSTEM_ARCHITECTURE.md`: Firebase, Express, and MongoDB trust boundaries.
- `docs/AUTHENTICATION_FLOW.md`: mobile session and account-state flow.
- `docs/API_AUTHENTICATION.md`: authenticated endpoint contract.
- `docs/ENVIRONMENT_SETUP.md`: public mobile and private server configuration.
- `docs/QA_CHECKLIST.md`: manual verification checklist.

## Locked tabs

- Client/Realtor: Home, Properties, Messages, More.
- Staff: Home, Bookings, Messages, More.
- Stakeholder: Home, Analytics, Properties, More.
- Admin: Home, Management, Analytics, More.

Do not add, remove, rename, or reorder these visible tabs.
