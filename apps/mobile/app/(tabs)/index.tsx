/**
 * Dashboard / Home screen.
 * Shows stats and quick actions.
 * @package @brol/mobile
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography } from "../../src/theme";
import { useAuth, useIsAuthenticated } from "../../src/lib/use-auth";
import { trpc } from "../../src/lib/trpc";
import { Spinner } from "../../src/components/ui/spinner";

/**
 * Dashboard screen.
 * Shows: nb objets, prêts actifs, contacts, actions rapides.
 * Stats fetched via tRPC `tier.getLimits` (single batched count query).
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const isAuthenticated = useIsAuthenticated();

  const stats = trpc.tier.getLimits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>BROL</Text>
        <Text style={styles.subtitle}>&gt; Dashboard _</Text>
        {user && (
          <Text style={styles.userEmail}>{user.email}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatBox
          label="Objets"
          value={stats.data?.limits.objects.current}
          loading={stats.isLoading}
          variant="default"
        />
        <StatBox
          label="Pretes"
          value={stats.data?.limits.activeLoans.current}
          loading={stats.isLoading}
          variant="warning"
        />
        <StatBox
          label="Contacts"
          value={stats.data?.contactCount}
          loading={stats.isLoading}
        />
      </View>

      {stats.isError && (
        <Text style={styles.errorText}>
          Erreur de chargement des stats
        </Text>
      )}

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>// ACTIONS</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() => router.push("/scan")}
        >
          <Text style={styles.actionTitle}>SCANNER</Text>
          <Text style={styles.actionDesc}>QR code ou ISBN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionSecondary]}
          onPress={() => router.push("/loans/new")}
        >
          <Text style={styles.actionTitle}>NOUVEAU PRET</Text>
          <Text style={styles.actionDesc}>Preter un objet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionAccent]}
          onPress={() => router.push("/objects/add")}
        >
          <Text style={styles.actionTitle}>AJOUTER</Text>
          <Text style={styles.actionDesc}>Nouvel objet</Text>
        </TouchableOpacity>
      </View>

      {/* Prets recents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>// PRETS RECENTS</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun pret recent</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Stat box component.
 */
function StatBox({
  label,
  value,
  loading = false,
  variant = "default",
}: {
  label: string;
  value?: number;
  loading?: boolean;
  variant?: "default" | "warning" | "success";
}) {
  const valueColor =
    variant === "warning"
      ? colors.accent
      : variant === "success"
      ? colors.secondary
      : colors.foreground;

  return (
    <View style={styles.statBox}>
      {loading ? (
        <View style={styles.statSpinner}>
          <Spinner size="small" />
        </View>
      ) : (
        <Text style={[styles.statValue, { color: valueColor }]}>
          {value ?? "--"}
        </Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  logo: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 48,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
  userEmail: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.xl,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  statValue: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 32,
  },
  statSpinner: {
    height: 38,
    justifyContent: "center",
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.accent,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.mutedForeground,
    textTransform: "uppercase",
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  actionButton: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  actionPrimary: {
    borderColor: colors.primary,
  },
  actionSecondary: {
    borderColor: colors.secondary,
  },
  actionAccent: {
    borderColor: colors.accent,
  },
  actionTitle: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 20,
    color: colors.foreground,
  },
  actionDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  emptyState: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
  },
});