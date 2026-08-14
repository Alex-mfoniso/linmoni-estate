# Rive integration plan

Phase A intentionally does not reference nonexistent `.riv` files or import an uninstalled native runtime.

`components/RiveIllustration.js` is the stable app-facing layer. Today it renders `assets/illustrations/architectural-state.png`. A future runtime adapter can inject a real `RiveComponent` and its props without changing empty/error screens.

## Required production assets

Create one coherent LINPAL artboard family with forest, ivory, charcoal, and muted-gold colours; consistent architectural geometry; and restrained timing.

- `auth-home`: idle and secure-confirmation states.
- `empty-properties`: search and no-results states.
- `empty-messages`: idle and first-message cue.
- `empty-bookings`: idle and booking-success states.
- `offline-home`: disconnected and reconnected states.
- `generic-error`: idle and retry acknowledgement.
- `account-status`: verification, invitation, disabled, and approved states.

Every `.riv` file needs a static PNG fallback, accessibility description, documented state-machine/input names, and a reduced-motion behavior. Pause animations when a screen is unfocused or backgrounded.

## Runtime adoption checklist

1. Validate the current Rive React Native package against Expo SDK 57 and the chosen development-build workflow.
2. Install with Expo-compatible native configuration and regenerate development builds.
3. Add a small adapter that imports the runtime in one file only.
4. Test Android lifecycle, memory use, screen-reader labels, and reduced motion.
5. Replace fallbacks screen by screen only after each state machine is present and verified.
