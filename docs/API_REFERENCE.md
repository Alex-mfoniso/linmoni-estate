# Phase C API reference

Base prefix: `/api/v1`. All Phase C routes use bearer authentication plus active Client profile authorization.

| Resource | Operations |
| --- | --- |
| Client home | `GET /client/home` |
| Properties | `GET /properties`, `/properties/featured`, `/properties/recommended`, `/properties/:id`, `/properties/:id/similar` |
| Favourites | `GET /favourites`, `POST /favourites/:propertyId`, `DELETE /favourites/:propertyId` |
| Bookings | `GET /bookings`, `POST /bookings`, `PATCH /bookings/:bookingId/cancel` |
| Conversations | `GET /conversations`, `POST /conversations`, `GET /conversations/unread-count`, `GET|POST /conversations/:id/messages`, `PATCH /conversations/:id/read` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all`, `PATCH /notifications/:id/read`, `DELETE /notifications/:id` |
| Profile | `GET /profile`, `PATCH /profile` |

Success responses use `{ success, message, data }`; the mobile client unwraps `data`. Errors use stable `code`, safe `message`, and optional field `errors`. Collection responses return `{ items, pagination }`, where pagination includes page, limit, totals, and next/previous flags.
