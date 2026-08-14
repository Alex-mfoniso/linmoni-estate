# Property schema

`Property` stores title/slug/description, type and listing type, numeric price and ISO currency, public location/city/state/country, private address and coordinates, room and size facts, amenities, Cloudinary-compatible image metadata, status, featured flag, Realtor ownership, creator/approver references, and publication timestamps.

Client-visible statuses are `active`, `reserved`, `sold`, and `rented`; only `active` is bookable. Indexed fields cover publication status, location/type/price discovery, and text search. `address`, coordinates, creator, and approver use server-side exclusion and are never part of the Client serializer.
