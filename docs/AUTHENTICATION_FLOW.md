# Authentication flow

At startup, `AuthContext` subscribes to Firebase auth state. A signed-out user is routed to login. A restored Firebase user obtains an ID token through the centralized API client, calls `GET /api/v1/auth/me`, and is routed only after MongoDB profile resolution.

Outcomes are centralized: missing profile -> recovery; disabled/suspended/invited/unknown role -> controlled account state; pending/unverified -> verification; `mustChangePassword` -> Firebase password update; offline/API unavailable -> retry state; active known role -> corresponding role dashboard.

Registration creates a Firebase email/password account, sends a verification email, then calls the duplicate-safe client-profile endpoint with only full name and phone. Safe recovery values remain in memory if profile creation fails; the password is never retained. Verification reloads Firebase, refreshes the ID token, then lets Express consume the trusted `email_verified` claim.

Logout attempts a trusted audit event, cancels authenticated requests, signs out of Firebase, clears profile/recovery state, and navigation resolves to login even if the API is unavailable.
