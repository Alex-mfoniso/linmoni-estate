# Phase A audit and foundation report

Date: 2026-07-22

## Scope and outcome

Phase A audited the recovered Expo project and improved shared presentation foundations only. Authentication and production backend migration remain explicitly out of scope until Phase B. No existing route, data model, service function, or role workflow was removed.

The most important audit conclusion is that this repository is currently a local demo application. It is not yet the Firebase Authentication → Express → MongoDB architecture described by the product brief. Firebase is configured but is not used by `AuthContext` or `authService`; most product records and plain-text demo passwords are stored in AsyncStorage. No Express or MongoDB backend source exists in this repository.

## Existing architecture

- Expo SDK 57.0.0 (`expo` 57.0.6) with React Native 0.86 and React 19.2.
- Expo Router 57 file-based route groups for auth, client, realtor, staff, stakeholder, and admin.
- One shared `AuthContext` protects role groups and redirects by profile role.
- Local service modules implement users, properties, favourites, bookings, messages, notifications, invitations, analytics, and audit entries on AsyncStorage.
- Firebase client initialization exists in `firebase/config.js`, including Auth, Firestore Lite, and Storage, but no application service imports those clients.
- Cloudinary supports unsigned uploads through a public upload preset and optimized delivery URL construction.
- UI uses React Native `StyleSheet`, shared components, Expo Image, Ionicons, and React Native Reanimated.
- There is no backend directory, Express API client, MongoDB model, server token verification, or server authorization layer in this checkout.

## Integration review

### Firebase

Partially configured, not integrated. Public Firebase configuration is loaded through Expo public environment variables and native auth persistence is initialized with AsyncStorage. Login, registration, password reset, session restoration, and password changes currently bypass Firebase and call the local `userService` instead. Firestore and Firebase Storage are initialized but unused; they must not become profile sources in Phase B.

### MongoDB and Express

Missing from this repository. There are no models, controllers, routes, middleware, Firebase Admin token checks, or MongoDB connection code to audit. The mobile app also has no centralized authenticated HTTP client. Phase B needs a confirmed backend repository or deployed API contract before the identity flow can be implemented safely.

### Cloudinary

Partially working. Mobile uploads validate type and a 12 MB limit, support sequential multiple upload, and return public IDs and optimized delivery URLs. Missing pieces include upload progress, cancellation, retry/resume, signed upload support, server-side deletion, and explicit cover-image persistence. An unsigned preset is acceptable only when tightly restricted in Cloudinary; API secrets must remain server-side.

## Feature status

### Working as local demo flows

- Role-group routing and wrong-role redirects.
- Local client registration and login for seeded accounts.
- Property browse, filtering, detail, creation, edit, and delete flows.
- Favourites and client booking creation.
- Booking review and status changes.
- Conversation lists, messages, unread counts, and local subscription callbacks.
- Notification lists and read/delete actions.
- Admin users, invitations, roles/statuses, analytics, and audit entries.
- Profile editing and role dashboard content.
- Expo Image/Cloudinary delivery helpers and multi-image selection.

### Partial

- Authentication: UI and local flows exist; Firebase is bypassed.
- Session restoration: restores a local serialized mock session, not Firebase auth state.
- Messaging/notifications: local event subscriptions only, not real-time server transport.
- Analytics: computed from local demo arrays and dates, not server aggregates.
- Offline: the global banner can observe browser connectivity and probe the configured backend; native detection is intentionally conservative until NetInfo is approved.
- Stakeholder reporting and staff property oversight use placeholder screens.
- Loading and error components exist, but adoption is inconsistent across data screens.
- Forms use React Hook Form/Yup in several auth flows, while other forms use manual state and validation.

### Broken or high-risk

- `utils/storage.js` used a nonexistent `createAsyncStorage` export with AsyncStorage 2.2.0. It silently fell back to in-memory storage, so all demo data could disappear on restart. Phase A corrected it to the supported default AsyncStorage API.
- The visible fourth tab is `More` for every role, following the product owner's latest direction; profile remains available inside each role's More flow.
- Password reset reports success without sending a Firebase reset email.
- Plain-text demo passwords and role changes are implemented on the client.
- Client-side admin services provide no real authorization boundary.
- The app display name and splash palette were still Expo starter values; the display name and splash/adaptive background were corrected. Package identifiers and URL scheme still use placeholder values and need owner confirmation.

## Screen inventory

- Auth (5): login, register, forgot password, invitation acceptance, temporary-password change.
- Client (10): home, property list/detail/booking, messages/conversation, profile, saved properties, bookings, notifications, more.
- Realtor (11): home, own properties/list/detail/new/edit, add-property compatibility route, messages/conversation, bookings, notifications, profile, more.
- Staff (7): home, bookings, messages/conversation, properties placeholder, notifications, profile, more.
- Stakeholder (7): home, analytics, properties placeholder, reports placeholder, notifications, profile, more.
- Admin (16): home, management, analytics, users/list/detail/create, properties/list/detail, bookings, invitations/list/detail, messages/list/conversation, notifications, profile, more.
- Global (2): index redirect and error boundary.

## Component inventory and reuse

The project contains 77 shared component files. The strongest reusable foundations are:

- Layout/navigation: `ScreenContainer`, `AppHeader`, `DashboardScreen`, `DashboardHeader`, `RoleBasedTabBar`, `ProtectedGroup`.
- Actions/forms: `PrimaryButton`, `SecondaryButton`, `AppInput`, `FormField`, `SearchBar`, `FilterModal`, `BottomSheet`, `ConfirmationModal`.
- Property/media: `PropertyCard`, `ImageCarousel`, `FullScreenImageViewer`, `PropertyImageUploader`, `SelectedImagePreview`.
- Messaging/notifications: `ConversationListScreen`, `ConversationCard`, `ChatScreen`, `MessageBubble`, `MessageComposer`, `NotificationListScreen`, `NotificationCard`.
- Dashboard/data: `DashboardCard`, `DashboardStatsGrid`, `StatCard`, `AnalyticsSection`, `SimpleBarChart`, `SimpleDonutChart`, `ActivityTimeline`.
- States: `ScreenLoader`, `SkeletonLoader`, `SkeletonCard`, `SkeletonList`, `EmptyState`, `ErrorState`, `OfflineBanner`, `AnimatedStateView`, `RiveIllustration`.

Compatibility aliases that should not become new design variants: `SecondaryButton` → `PrimaryButton`, `FormField` → `AppInput`, `ConfirmDialog` → `ConfirmationModal`, and `ScreenLoader`/`FullScreenLoader` for different loading contexts. `LoadingSpinner`, `InlineLoader`, `ButtonLoader`, and `FullScreenLoader` overlap but represent legitimate scopes; their visual language should converge over later phases.

## GPT Taste and redesign critique

The two required upstream skill documents were reviewed and applied as design-review criteria. Their web-only requirements (AIDA marketing pages, GSAP, CSS bento grids, random layout generation) are not appropriate for this React Native product and were not copied literally. The relevant rules—anti-template restraint, deliberate typography, reduced card repetition, visible states, targeted motion, real imagery, and focused changes—guided Phase A.

Installation note: both skills were located in `Leonxlnx/taste-skill`. The Codex installer failed because this workstation rejects GitHub's certificate chain; its SSH fallback also had no configured key. The repository's documented installer failed on the same TLS error. The exact upstream `SKILL.md` files were therefore loaded and applied for this run, but the skills are not claimed as installed.

- Authentication: currently a centered floating card with decorative circles and an all-caps brand pill. It reads like a generic template. Phase B should use a quieter editorial split, visible field labels, restrained brand art, and direct recovery/status messaging.
- Dashboards: repeated bordered white cards, oversized weights, and similar layouts flatten role differences. Later phases should privilege the role’s primary task and use cards only for grouped actions or elevation.
- Property cards/details: photography and price hierarchy are the right focus, but fact pills and multiple equal actions add noise. Keep one dominant action, a text-level secondary action, consistent media ratio, and tabular prices.
- Forms: labels and validation exist in shared inputs, but many screens still use raw `TextInput`, alerts, and manual validation. Standardize without rewriting working form submission logic.
- Messaging/bookings: the information architecture is functional but needs clearer unread/property context, stable timestamps, optimistic/offline states, and fewer generic containers.
- Analytics: charts are useful and restrained, but stat grids are repetitive. Promote the single decision-driving metric and provide data context/date range near each chart.
- Profile/management: action density is high and destructive/administrative actions need stronger grouping and confirmations. Do not add more tabs; use internal sections inside Management.
- States: empty/error/loading treatments were inconsistent and spinner-heavy. Phase A added one coherent architectural fallback, layout-matched skeletons, purposeful entry motion, and reduced-motion handling.
- Bottom tabs: Phase A added visible labels, an active indicator, accessibility state, and restrained feedback. The fourth destination is `More` following the product owner's latest direction.

## Visual direction

- Warm ivory page canvas, white and warm-muted surfaces.
- Deep forest primary, muted antique-gold accent only for emphasis.
- Dark green-charcoal text and one coherent warm-neutral border family.
- Property photography remains the strongest visual asset.
- Sentence-case labels, fewer all-caps kickers, more 600/700 hierarchy, tabular numbers.
- Tighter inner radii than outer containers; shadows only when hierarchy needs elevation.
- Motion intensity: low to moderate. 180–380 ms transitions, small travel distances, no endless motion, and reduced-motion compliance.
- Density: medium for client/realtor, medium-high for admin/stakeholder analytics.

## Security concerns

1. Critical: authentication, passwords, roles, account status, and admin operations are client-side local data.
2. Critical: there is no verified Firebase ID-token boundary or server-side role authorization.
3. High: demo passwords are embedded in source and persisted in local storage.
4. High: invitation token hashing has a non-cryptographic fallback and invitations are enforced locally.
5. High: audit logs are user-writable local records and cannot be trusted.
6. Medium: Cloudinary unsigned upload policy is controlled by a public preset; deletion/signature logic is absent.
7. Medium: error boundary exposes raw `error.message`; production should avoid server stack detail.
8. Medium: Firebase Storage/Firestore initialization invites accidental client data duplication even though they are unused.

Do not “patch around” these concerns in the client. Phase B requires server contracts and authoritative MongoDB profiles.

## Performance and accessibility concerns

- Only five files use `FlatList`; many potentially growing datasets use `ScrollView` or mapped children.
- Local services read/write full JSON arrays for every mutation and will not scale.
- Message/notification subscriptions are in-process callbacks, not durable connections.
- Accessibility coverage was sparse (two labels and four roles before Phase A); shared buttons, inputs, tab items, states, and images now carry better semantics, but screen-level focus order and announcements remain.
- Several large screens exceed 250 lines, increasing rerender and review risk.
- React Compiler is enabled, but manual memoization/list key strategy and focus-driven request control still need screen-by-screen review.

## Files requiring care

- `contexts/AuthContext.js`, `services/authService.js`, `services/userService.js`: current session and identity contract.
- `utils/storage.js`: all local demo persistence.
- `firebase/config.js` and `app.config.js`: environment and platform identity.
- Every role `_layout.js`: locked bottom-tab contract and protected routing.
- `services/propertyService.js`, `bookingService.js`, `messageService.js`, `notificationService.js`: shared local data contracts consumed by many screens.
- `services/cloudinaryService.js` and `utils/propertyMedia.js`: upload/delivery compatibility.
- `constants/roles.js` and `utils/authRoutes.js`: role names and redirects.

## Recommended implementation order

1. Confirm the Express/MongoDB backend repository and API contract.
2. Phase B: Firebase auth state, ID-token API client, authoritative MongoDB profile/status, protected redirects.
3. Phase C: client discovery/property detail/bookings/messages.
4. Phase D: realtor listings, uploads, booking and messaging operations.
5. Phase E: staff operational booking and messaging flows.
6. Phase F: stakeholder portfolio and decision-oriented analytics.
7. Phase G: admin Management internal navigation and server-authorized controls.
8. Phase H: pagination/virtualization, accessibility pass, security validation, device testing, and APK readiness.

## Phase A changes

- Centralized and expanded color, spacing, radius, typography, breakpoint, icon-size, and motion tokens.
- Added `AnimatedStateView`, reduced-motion hook, Reanimated skeleton shimmer, and tab feedback.
- Added a Rive-ready injection layer with a static architectural PNG fallback; no broken `.riv` path or unavailable runtime import was added.
- Unified shared empty/error/loading presentation and restored a global offline banner.
- Corrected AsyncStorage persistence.
- Kept all role tab sets at four visible items and restored `More` as the fourth item following the product owner's latest direction; no route was deleted or renamed.
- Updated shared input/button/property card accessibility and presentation.
- Removed decorative background circles from the general screen container.
- Updated product display name and launch background colors.

## Verification

- Expo SDK 57 Router and Reanimated versioned documentation reviewed.
- Expo public config resolved successfully (`sdkVersion` 57.0.0).
- Babel parser passed all 182 JavaScript/TypeScript source files.
- Expo Babel transform passed all JavaScript source files.
- Android production export passed: Metro bundled 1,844 modules and produced a 4.7 MB Hermes bundle in `C:\tmp\linpal-phase-a-export`.
- `expo lint` was attempted; it could not bootstrap ESLint because the machine’s TLS certificate chain rejects the package download.
- Expo Doctor timed out while `npx` waited on the broken certificate path. `expo install --check` reached the registry but failed with `unable to verify the first certificate`.
- ADB is available, but no Android device is attached and no emulator command/AVD is installed, so an on-device launch could not be performed.

## Unresolved Phase A items

- Rive runtime and `.riv` assets are not installed. See `docs/RIVE_ASSETS.md`.
- Native offline reachability needs `@react-native-community/netinfo` or an agreed alternative when package installation works.
- ESLint is not configured and could not be installed due TLS certificate validation.
- An actual Android emulator/device startup and mid-range device performance pass remain pending.
- Package identifiers, URL scheme, production icons, and EAS ownership need product-owner confirmation.
- Authentication and backend gaps intentionally remain for Phase B.

## Contract confirmation

Working local demo logic was preserved. No feature route was deleted. No auth migration was started. The fourth tab is `More` for all roles following the product owner's latest direction. Phase B must not begin automatically.
