# LINPAL Security Checklist & Control Audit

This security audit reviews the defense mechanisms, identity partitions, and data leakage mitigations across client and server layers.

---

## 1. Authentication & Session Management

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **Token Verification** | All incoming REST API requests validated via Firebase Admin SDK. | **PASS** | Checked inside `requireAuth` middleware layer. |
| **State Persistence** | Secure device token caching utilizing Expo AsyncStorage. | **PASS** | Automatically managed by `getReactNativePersistence`. |
| **Session Expiration** | Client-side automatic re-authentication upon token expiry. | **PASS** | Handled securely within `AuthContext.js` hooks. |
| **Disabled Accounts** | Status is verified on Mongoose profile lookup; disabled profiles reject incoming connections. | **PASS** | Prevents compromised profile connections. |

---

## 2. Role-Based Authorization

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **Admin Controls** | Routes guarded with `requireRole("admin")`. | **PASS** | Tested and verified via `adminApi.test.js`. |
| **Staff Workspaces** | Routes guarded with `requireRole("staff")`. | **PASS** | Blocks Client/Realtor role access at Express route level. |
| **Stakeholder Reports**| Routes guarded with `requireRole("stakeholder")`. | **PASS** | Blocks Realtor, Client, and Staff access. |
| **Realtor Workspace** | Routes guarded with `requireRole("realtor")`. | **PASS** | Blocks Client access. |

---

## 3. IDOR Mitigation (Insecure Direct Object References)

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **User Profile Guard** | Checking `req.user._id === req.params.id` on user edit. | **PASS** | Users cannot read or edit other user profiles. |
| **Properties Guard** | Realtors can only edit/delete property listings matching their `realtorId`. | **PASS** | Enforced inside property controllers. |
| **Conversations Guard**| Users can only read conversations containing their own ID (as client or realtor). | **PASS** | Enforced within message lookup queries. |
| **Bookings Guard** | Clients can only view/cancel their own bookings. | **PASS** | Staff or Realtors handle assigned properties bookings. |

---

## 4. Mass Assignment Controls

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **Mongoose Models** | Use strict Zod validation schema parsing instead of dumping raw `req.body`. | **PASS** | Never use unrestricted updates on User profiles or Roles. |
| **System Settings** | Platform settings restrict inputs to whitelisted elements. | **PASS** | Tested under `adminApi.test.js` update tests. |

---

## 5. File Upload Security

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **Type Validation** | Client normalizer validates `mimeType` starts with `image/`. | **PASS** | Rejects non-image files on selection. |
| **Size Limitations** | Maximum asset size strictly capped at 12MB. | **PASS** | Capped and tested via Cloudinary asset normalizer. |
| **Secrets Exposure** | Cloudinary private API secret key is kept server-side only. | **PASS** | Expo package uses restricted unsigned upload preset. |

---

## 6. Logging & Auditing

| Security Control | Verification Action | Status | Notes |
| --- | --- | --- | --- |
| **Passwords Censor** | Sensitive values are excluded from pino logger serializers. | **PASS** | Passwords are never serialized. |
| **Administrative Log** | Append-only security logging of role, suspension, and settings changes. | **PASS** | Written to database with read-only client access. |
| **Error Sanitization**| Internal database stack-traces are masked; generic standard responses returned. | **PASS** | Handled in express error middleware. |
