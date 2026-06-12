/**
 * Input — wrapper TextInput thémé.
 * @package @brol/mobile
 */

import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helper, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          props.editable === false && styles.inputDisabled,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.destructive },
  inputDisabled: { opacity: 0.5 },
  error: {
    color: colors.destructive,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  helper: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
});
