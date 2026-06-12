/**
 * EmptyState — bloc centré pour lists vides.
 * @package @brol/mobile
 */

import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "[--]", title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  icon: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 28,
    letterSpacing: 4,
  },
  title: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },
  description: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    textAlign: "center",
  },
  action: { marginTop: spacing.sm },
});
