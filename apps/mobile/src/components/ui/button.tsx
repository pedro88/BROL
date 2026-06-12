/**
 * Button — primitif RN avec variants VHS.
 * @package @brol/mobile
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  fullWidth,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.inner}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? colors.primaryForeground : colors.primary}
            style={{ marginRight: spacing.xs }}
          />
        )}
        {typeof children === "string" ? (
          <Text style={[styles.label, styles[`label_${variant}`], styles[`label_size_${size}`]]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },

  // sizes
  size_sm: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  size_md: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  size_lg: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },

  // variants
  variant_primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  variant_outline: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  variant_ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  variant_destructive: {
    backgroundColor: "transparent",
    borderColor: colors.destructive,
  },

  // labels
  label: {
    fontFamily: typography.fontFamily,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  label_size_sm: { fontSize: 11 },
  label_size_md: { fontSize: 13 },
  label_size_lg: { fontSize: 15 },
  label_primary: { color: colors.primaryForeground },
  label_outline: { color: colors.foreground },
  label_ghost: { color: colors.foreground },
  label_destructive: { color: colors.destructive },
});
