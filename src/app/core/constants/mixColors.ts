/**
 * Accent colors a saved mix can be tagged with. Each value is a key into the
 * neon theme palette (see `retroTheme`), so the stored color stays
 * theme-driven — components resolve it via `theme.palette[key].main` rather
 * than persisting a raw hex value that could drift from the design tokens.
 */
export const MIX_COLOR_KEYS = Object.freeze([
  'blue',
  'teal',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
] as const);

/** A theme palette key usable as a saved mix's accent color. */
export type MixColorKey = (typeof MIX_COLOR_KEYS)[number];
