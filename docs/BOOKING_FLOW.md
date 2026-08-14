# Booking flow

Clients choose a future date and time in West Africa Time. Mobile submits only `propertyId`, an ISO `scheduledAt`, `timezone`, and optional message. The API derives Client and Realtor ownership from authenticated/profile/property records.

The API rejects unavailable properties, past times, and duplicate active requests for the same property/time. Statuses are pending, confirmed, reschedule requested, completed, cancelled, rejected, and no-show. Pending/confirmed/reschedule-requested bookings can be cancelled until 12 hours before inspection; the server enforces the cutoff.
