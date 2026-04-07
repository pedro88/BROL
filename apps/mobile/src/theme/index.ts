/**
 * Thème VHS 80s pour React Native.
 * @package @brol/mobile
 */

import { Platform } from "react-native";

/**
 * Couleurs du thème.
 */
export const colors = {
  // Base
  background: "#0a0a0a",
  foreground: "#f0f0f0",

  // Primary - Magenta
  primary: "#ff00ff",
  primaryForeground: "#000000",

  // Secondary - Cyan
  secondary: "#00ffff",
  secondaryForeground: "#000000",

  // Accent - Jaune
  accent: "#ffff00",
  accentForeground: "#000000",

  // Muted
  muted: "#1a1a1a",
  mutedForeground: "#a0a0a0",

  // Card
  card: "#111111",
  cardForeground: "#f0f0f0",

  // Border
  border: "rgba(0, 255, 255, 0.3)",

  // Destructive
  destructive: "#ff0000",
  destructiveForeground: "#ffffff",

  // Status
  success: "#00ff00",
  warning: "#ffaa00",
};

/**
 * Espacements.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Typographie.
 */
export const typography = {
  fontFamily: Platform.select({
    ios: "Courier",
    android: "monospace",
    default: "monospace",
  }),
  fontFamilyDisplay: Platform.select({
    ios: "Courier",
    android: "monospace",
    default: "monospace",
  }),
};

/**
 * Border radius.
 */
export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
};

/**
 * Shadows avec glow VHS.
 */
export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  glowCyan: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

export default { colors, spacing, typography, radius, shadows };
