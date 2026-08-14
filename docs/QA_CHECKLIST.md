# QA Checklist

## Phase B identity

- [ ] Configure real Firebase client values and enable Email/Password authentication.
- [ ] Configure private Firebase Admin and MongoDB server values outside source control.
- [ ] Verify registration creates only a pending client and rejects role/status/UID/email injection.
- [ ] Verify email reload + fresh token activates the pending MongoDB profile.
- [ ] Verify login/session restoration routes active known roles only after `/auth/me`.
- [ ] Verify missing, disabled, suspended, pending, unknown-role, offline, and unavailable states.
- [ ] Verify forced password update sends the password only to Firebase and clears the MongoDB flag afterward.
- [ ] Verify logout succeeds with the API offline and protected back navigation is unavailable.
- [ ] Verify local invitation/internal-role creation stays blocked.
- [ ] Run `npm run test:mobile-auth`, server tests, Expo lint/config/doctor/export, and live integration smoke tests when credentials exist.

## Client

- Register a client account.
- Sign in and confirm redirect to the client dashboard.
- Browse properties, search, filter, and sort.
- Save and remove a favorite property.
- Book an inspection.
- View bookings and cancel a pending request.
- Update profile details and sign out.

## Realtor

- Sign in as a realtor.
- Review assigned properties.
- Create a property.
- Edit and delete a property.
- View bookings and approve/reject/complete them.
- Confirm only four bottom tabs remain visible.

## Staff

- Sign in as staff.
- Review bookings and update status.
- View properties and profile.

## Stakeholder

- Sign in as stakeholder.
- Open reports and analytics.
- Review properties and profile.

## Admin

- Sign in as admin.
- Open Users and create a direct internal account.
- Create and manage invitations.
- Open user details and edit account metadata.
- Review properties, bookings, messages, notifications, and analytics.

## Stability

- Reload the app and confirm session restoration.
- Open screens with no data and confirm meaningful empty states.
- Turn off network and confirm the offline banner appears.
- Confirm no secret values are visible in source-controlled example files.
