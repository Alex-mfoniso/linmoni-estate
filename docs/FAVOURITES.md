# Favourites

`Favourite` is an ownership join between the authenticated MongoDB user and a property. Its compound unique index makes saving idempotent and prevents duplicate rows.

- `GET /api/v1/favourites?page=1&limit=20`
- `POST /api/v1/favourites/:propertyId`
- `DELETE /api/v1/favourites/:propertyId`

The server ignores client identity claims and scopes every operation to the authenticated profile. The mobile UI updates hearts optimistically and rolls back when the API rejects the write. It stores no property snapshot as authoritative Client data.
