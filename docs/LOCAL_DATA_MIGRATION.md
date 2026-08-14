# Local data migration

Client Phase C treats MongoDB APIs as the only business-data authority. Client routes no longer import the AsyncStorage property, favourite, booking, message, or notification services.

Existing local records are deliberately not uploaded automatically: they contain demo identities, denormalized snapshots, inconsistent statuses, and untrusted ownership fields. Automatic import would risk assigning records to the wrong production user. Clear or ignore those keys after verifying the server environment. The legacy services remain for out-of-scope role screens and local demos until their later migration phase.

The guarded server seed creates only idempotent sample properties. Run `ENABLE_DEMO_SEED=true npm run seed:client-demo` from `server` after configuring MongoDB and creating an active Realtor profile. It refuses production and never creates Firebase credentials.
