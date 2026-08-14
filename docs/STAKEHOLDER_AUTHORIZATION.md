# Stakeholder Authorization & Security Boundaries

This document outlines the security specifications, permission guards, and role scoping implemented to protect the LINPAL Premium Estates operational integrity.

---

## 🛑 Security Axioms
1.  **Read-Only Scope**: Stakeholders can consume business performance data but cannot alter real estate listings, delete users, or modify viewing bookings.
2.  **No Role Escalation**: The update profile endpoint is strictly locked to prevent mass assignment. Any request payload containing `role` or `status` edits will fail schema validation.
3.  **No Client-Side Identity trust**: The server never trusts client-supplied variables like `role` or `userId` in the HTTP headers or request body. Identity is verified server-side through Firebase session tokens.

---

## 🔒 Permission Boundaries Matrix

| Operation / Path | Client | Realtor | Staff | Stakeholder |
| :--- | :---: | :---: | :---: | :---: |
| **Search Properties** | Read | Read | Read | Read |
| **Verify Property** | None | None | Write | None |
| **Book Inspection** | Write | Read | Read | Read |
| **Overview Dashboard** | None | None | None | **Read** |
| **Corporate Audits** | None | None | None | **Read** |
| **Update Own Profile** | Write | Write | Write | **Write (Safe Fields)** |
| **Reassign Tasks** | None | None | Write | None |
| **Manage Roles** | None | None | None | None (Admin Only) |
