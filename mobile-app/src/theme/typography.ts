import { Platform } from "react-native";

export const typography = {
  // Font Families
  primary: "Inter_400Regular",
  secondary: "Poppins_500Medium",
  bold: "Poppins_700Bold",

  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    h1: 32,
    h2: 28,
  },

  // Line Heights
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  weights: {
    regular: "400" as const,
    medium: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
    black: "900" as const,
  },

  // Hierarchy
  title: {
    fontSize: 22,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  meta: {
    fontSize: 13,
    fontWeight: "400" as const,
    letterSpacing: 0.2,
  },
};
