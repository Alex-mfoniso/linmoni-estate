export const TYPOGRAPHY = {
  display: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
  },
  propertyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  propertyPrice: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
  },
  supporting: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  stat: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
};

TYPOGRAPHY.title = TYPOGRAPHY.screenTitle;
TYPOGRAPHY.section = TYPOGRAPHY.sectionTitle;
TYPOGRAPHY.card = TYPOGRAPHY.propertyTitle;

export default TYPOGRAPHY;
