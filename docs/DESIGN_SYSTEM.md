# LINPAL design system

The Phase A foundation lives in `constants/` and should be imported instead of repeated in screens.

## Principles

- Let property imagery carry emotion; UI chrome should be calm.
- Use elevation only to communicate hierarchy, not on every container.
- Prefer sentence case and direct copy.
- Keep one dominant action per content block.
- Use the muted-gold token sparingly for emphasis, not large surfaces.
- Never convey status by colour alone; pair colour with text or an icon.

## Tokens

- `colors.js`: forest/ivory palette, warm-neutral surfaces, borders, and semantic status pairs.
- `spacing.js`: 4 px base rhythm through 48 px section spacing.
- `radius.js`: tighter inner controls and softer outer containers.
- `typography.js`: display, screen, section, property, body, supporting, caption, input, button, stat, and empty-state roles.
- `shadows.js`: two tinted elevation levels.
- `motion.js`: durations, travel distances, and spring physics.
- `breakpoints.js`: compact, medium, and expanded layouts plus content widths.
- `iconSizes.js`: consistent icon sizing.

## Shared-state usage

- Use `ScreenLoader` for initial screen loads and `SkeletonCard` for layout-matched list placeholders.
- Render `EmptyState` only after loading succeeds with an empty result.
- Render `ErrorState` with a specific message and retry action after a recoverable failure.
- Keep `OfflineBanner` mounted once at the app root.
- Wrap low-priority entrances in `AnimatedStateView` or the compatibility `RevealView`; never delay access to content.
- Respect `useReducedMotion` for custom animations.

## Responsive guidance

- Compact: 16–20 px horizontal screen padding and one primary content column.
- Medium: allow two-column data groupings when scan order remains obvious.
- Expanded/web: constrain main screens to 920 px, forms to 520 px, and reading copy to 680 px.
- Use `FlatList`/FlashList for growing collections; do not map unbounded records into a `ScrollView`.
