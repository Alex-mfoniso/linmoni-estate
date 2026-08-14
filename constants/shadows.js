import { Platform } from "react-native";

export const SHADOWS = {
  card: {
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 20px rgba(18, 63, 58, 0.08)",
      },
      default: {
        shadowColor: "#123F3A",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      },
    }),
  },
  raised: {
    ...Platform.select({
      web: {
        boxShadow: "0px 14px 28px rgba(18, 63, 58, 0.12)",
      },
      default: {
        shadowColor: "#123F3A",
        shadowOpacity: 0.12,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
        elevation: 6,
      },
    }),
  },
};

export default SHADOWS;
