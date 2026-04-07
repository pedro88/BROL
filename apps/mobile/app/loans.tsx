/**
 * Écran Prets.
 * @package @brol/mobile
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, typography } from "../src/theme";

/**
 * Données mock.
 */
const LOANS = [
  { id: "1", object: "Asterix", borrower: "Jean", dueDate: "2026-04-15", status: "active" },
  { id: "2", object: "Le Petit Prince", borrower: "Marie", dueDate: "2026-04-01", status: "overdue" },
];

/**
 * Écran des prets.
 */
export default function LoansScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>PRETES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>EMPRUNTES</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={LOANS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.objectName}>{item.object}</Text>
              <Text style={styles.borrower}>Pretes a {item.borrower}</Text>
              <Text style={[
                styles.dueDate,
                item.status === "overdue" && styles.dueDateOverdue
              ]}>
                Retour: {item.dueDate}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              item.status === "overdue" ? styles.statusOverdue : styles.statusActive
            ]}>
              <Text style={styles.statusText}>
                {item.status === "overdue" ? "EN RETARD" : "EN COURS"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun objet prete</Text>
          </View>
        }
      />

      {/* FAB */}
      <Link href="/loans/new" asChild>
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primary,
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
  objectName: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    color: colors.foreground,
  },
  borrower: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  dueDate: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  dueDateOverdue: {
    color: colors.accent,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  statusActive: {
    borderColor: colors.secondary,
  },
  statusOverdue: {
    borderColor: colors.accent,
  },
  statusText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.foreground,
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
