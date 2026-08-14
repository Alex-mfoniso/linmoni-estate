# Booking schema

`Booking` references the authenticated Client (`userId`), property, and property Realtor. It stores `scheduledAt`, IANA timezone, optional Client message, lifecycle status, cancellation reason, and lifecycle timestamps.

Indexes support Client/status/schedule and Realtor/status/schedule queries. The Client serializer populates the public property representation and omits internal ownership fields. Booking creation and cancellation are rate limited and strictly validated.
