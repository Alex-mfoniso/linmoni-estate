# Local demo account migration

Seeded users and their plaintext demo passwords are not production identities and are not used by active authentication. Never upload those passwords automatically.

Migration choices:

1. Create Firebase users through a secure administrative migration and create matching MongoDB profiles with the resulting UIDs.
2. Require demo users to register again (public registration creates clients only).
3. Build trusted invitation-based internal accounts in a later backend phase.

Until business data is migrated, local records may not match new Firebase UIDs and some user-filtered demo lists may appear empty. Keep the seed data only for non-production demonstrations. Do not ship demo credentials in production material. Phase B blocks local internal-role creation and invitation acceptance.
