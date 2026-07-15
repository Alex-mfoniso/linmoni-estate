import COLORS from "./colors";
import { Platform } from "react-native";

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const RADII = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const SHADOWS = {
  card: {
    ...Platform.select({
      web: {
        boxShadow: "0px 10px 18px rgba(24, 59, 77, 0.08)",
      },
      default: {
        shadowColor: "#183B4D",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
      },
    }),
  },
  raised: {
    ...Platform.select({
      web: {
        boxShadow: "0px 14px 24px rgba(24, 59, 77, 0.12)",
      },
      default: {
        shadowColor: "#183B4D",
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
        elevation: 8,
      },
    }),
  },
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  card: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
};

export const SURFACES = {
  card: COLORS.surface,
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
