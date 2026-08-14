# LINPAL API

Phase B identity API for LINPAL Premium Estates. It verifies Firebase ID tokens and resolves application profiles, roles, and status from MongoDB; it never stores passwords or Firebase tokens.

Use Node.js 22+. Copy `.env.example` to `.env`, fill every value locally, then run `npm install`, `npm test`, and `npm start`. Never commit `.env` or a service-account JSON file.

Public registration creates client profiles only. Unverified clients are `pending`; a fresh verified Firebase claim activates them through the verification synchronization endpoint.
