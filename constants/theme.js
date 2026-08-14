import COLORS from "./colors";
export { SPACING } from "./spacing";
export { RADII } from "./radius";
export { SHADOWS } from "./shadows";
export { TYPOGRAPHY } from "./typography";

import { SPACING } from "./spacing";
import { RADII } from "./radius";
import { SHADOWS } from "./shadows";
import { TYPOGRAPHY } from "./typography";

export const SURFACES = {
  card: COLORS.surface,
  muted: COLORS.surfaceMuted,
  subtle: COLORS.softPrimary,
  input: COLORS.inputBackground,
  page: COLORS.background,
};

export default {
  colors: COLORS,
  spacing: SPACING,
  radii: RADII,
  shadows: SHADOWS,
  typography: TYPOGRAPHY,
  surfaces: SURFACES,
};
