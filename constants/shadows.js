import { Platform } from "react-native";

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

export default SHADOWS;
