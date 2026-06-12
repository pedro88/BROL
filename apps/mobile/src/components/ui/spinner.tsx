/**
 * Spinner — ActivityIndicator thémé.
 * @package @brol/mobile
 */

import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";

interface SpinnerProps {
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function Spinner({ size = "large", fullScreen }: SpinnerProps) {
  return (
    <View style={[styles.wrapper, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={colors.primary} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
