/**
 * Collections screen (tab).
 * @package @brol/mobile
 */

import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../src/theme";

export default function CollectionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>COLLECTIONS</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucune collection</Text>
        <Text style={styles.emptySubtext}>Créez votre première collection</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 32,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  emptySubtext: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
});