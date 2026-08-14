# Phase C — Client experience

Phase C replaces the Client role's demo-storage business flows with authenticated Express/MongoDB APIs and refreshes its mobile experience. The visible Client tabs are Home, Properties, Messages, and Profile. The legacy More route remains hidden for route compatibility. Realtor, Staff, Stakeholder, and Admin experiences are out of scope and retain their Phase B behavior.

Delivered scope: property discovery/detail, favourites, inspection bookings, property conversations, notifications, Client home aggregation, profile navigation, server-side authorization, validation, pagination, cancellation, tests, and guarded demo seed data.

The backend derives the acting Client from the verified Firebase token and MongoDB profile. Mobile requests never submit a trusted `clientId`, `realtorId`, participant list, sender identity, role, or account status.

Known operational dependencies: a configured Firebase project, MongoDB, an active Client profile, and at least one active Realtor profile. Messaging is request/refresh based; Phase C does not claim sockets or realtime delivery.
