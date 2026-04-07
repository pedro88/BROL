/**
 * Écran Collections.
 * @package @brol/mobile
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, typography } from "../src/theme";

/**
 * Données mock pour le moment.
 */
const COLLECTIONS = [
  { id: "1", name: "Bandes dessinees", count: 24 },
  { id: "2", name: "Romans", count: 12 },
  { id: "3", name: "Jeux de societe", count: 8 },
];

/**
 * Écran des collections.
 */
export default function CollectionsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={COLLECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/collections/${item.id}`} asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCount}>{item.count} objets</Text>
              </View>
              <Text style={styles.arrow}>&gt;</Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune collection</Text>
            <Text style={styles.emptySubtext}>Creez votre premiere collection</Text>
          </View>
        }
      />

      {/* FAB */}
      <Link href="/collections/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    color: colors.foreground,
  },
  cardCount: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  arrow: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    color: colors.primary,
  },
  empty: {
    alignItems: "center",
    padding: spacing.xl,
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
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  fabText: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 28,
    color: colors.primaryForeground,
  },
});
