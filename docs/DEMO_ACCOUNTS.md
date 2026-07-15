# Demo Accounts

Use these roles for demo walkthroughs. Passwords should be stored outside source control and loaded only in the local demo environment.

| Role | Email | Purpose | Screens to Demonstrate | Test Actions | Password Handling |
| --- | --- | --- | --- | --- | --- |
| Admin | `admin@linpal.demo` | Full platform management | Dashboard, Users, Invitations, Analytics, Profile | Create accounts, manage users, review logs | Keep in a local-only secret note or environment file |
| Staff | `staff1@linpal.demo` | Operations and bookings review | Home, Bookings, Properties, Profile | Approve/reject bookings, review properties | Do not commit password |
| Realtor | `realtor1@linpal.demo` | Property management | Home, My Properties, Add Property, Bookings, Profile | Create/edit properties, handle bookings | Do not commit password |
| Client | `client1@linpal.demo` | Browse and book properties | Home, Properties, Saved, Profile, My Bookings | Save properties, book inspections | Do not commit password |
| Stakeholder | `stakeholder@linpal.demo` | Reporting and oversight | Home, Reports, Properties, Profile | Review analytics and reports | Do not commit password |

## Notes

- The mobile app should never ship real demo passwords.
- Use local `.env` files or a secure password manager during presentations.
- If demo credentials change, update this document and the seed data together.
