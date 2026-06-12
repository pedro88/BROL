/**
 * Badge — petit chip de statut/compteur.
 * @package @brol/mobile
 */

import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

type Variant = "default" | "primary" | "success" | "warning" | "destructive" | "secondary";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <View style={[styles.base, styles[`variant_${variant}`]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.lg,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  variant_default: { backgroundColor: colors.muted },
  text_default: { color: colors.mutedForeground },

  variant_primary: { backgroundColor: "rgba(255,0,255,0.15)" },
  text_primary: { color: colors.primary },

  variant_secondary: { backgroundColor: "rgba(0,255,255,0.15)" },
  text_secondary: { color: colors.secondary },

  variant_success: { backgroundColor: "rgba(0,255,0,0.15)" },
  text_success: { color: colors.success },

  variant_warning: { backgroundColor: "rgba(255,170,0,0.15)" },
  text_warning: { color: colors.warning },

  variant_destructive: { backgroundColor: "rgba(255,0,0,0.15)" },
  text_destructive: { color: colors.destructive },
});
