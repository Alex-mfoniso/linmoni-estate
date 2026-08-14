# Phase B migration

Phase B replaces only identity authority. Firebase Authentication now owns credentials, UID, email verification, password reset/update, session persistence, and ID tokens. Express verifies every ID token with Firebase Admin. MongoDB owns the LINPAL profile, role, status, and `mustChangePassword`.

Existing property, favourite, booking, conversation, message, notification, invitation-display, analytics, and dashboard demo records remain local temporarily. Their administrative mutations are not a secure production boundary until later server endpoints exist. Local passwords are retained only inside legacy seed data and are not imported by `AuthContext` or the active `authService`.

Public registration can create `client` only. The server ignores no identity fields—it rejects them—and derives UID, email, and verification from the token. New unverified clients are `pending`. A fresh verified Firebase claim activates the profile. Missing profiles never receive a guessed role.

The previous context names (`currentUser`, `userProfile`, `loading`, `register`, `forgotPassword`, `refreshUser`) remain compatibility aliases. Their data now comes from Firebase and the API. Internal invitation acceptance and internal-role creation are disabled until a trusted backend workflow is built. Phase C has not started.
