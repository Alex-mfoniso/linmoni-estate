# MongoDB schema

`User` maps one immutable, unique `firebaseUid` to one unique normalized email. Safe profile fields are full name, phone, role (`client|realtor|staff|stakeholder|admin`), status (`active|disabled|suspended|invited|pending`), verification, avatar metadata, password-change flag, and timestamps. `createdBy` and throttled `lastLoginAt` are not selected into API profiles. There is no password, ID-token, or refresh-token field.

`AuditLog` records trusted server events with actor IDs, a fixed action enum, target, allow-listed metadata, bounded IP/user-agent, and creation time. It must never contain credentials, authorization headers, reset links, database URIs, or service-account material.

Role and status are MongoDB authority. Public registration hard-codes `client`, derives identity from Firebase, and starts unverified accounts as `pending`. Duplicate UID/email conflicts are translated to stable safe codes.
