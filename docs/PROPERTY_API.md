# Property API

All routes require a valid Firebase bearer token, an existing active MongoDB profile, and the Client role.

- `GET /api/v1/properties` — paginated discovery. Supports `search`, `propertyType`, `listingType`, `city`, `state`, `country`, price bounds, bedroom/bathroom minimums, `featured`, `sort`, `page`, and `limit`.
- `GET /api/v1/properties/featured?limit=6`
- `GET /api/v1/properties/recommended?limit=6`
- `GET /api/v1/properties/:propertyId`
- `GET /api/v1/properties/:propertyId/similar`

Only Client-visible statuses are returned. Exact locations, coordinates, approval fields, and creator identity are not serialized. Page size is capped at 50; compact endpoints cap `limit` at 12.
