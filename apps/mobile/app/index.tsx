/**
 * Écran d'accueil principal.
 * @package @brol/mobile
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, typography } from "../src/theme";

/**
 * Écran d'accueil avec navigation et actions rapides.
 */
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>BROL</Text>
        <Text style={styles.subtitle}>&gt; Gestion de pret _</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatBox label="Objets" value="24" />
        <StatBox label="Pretes" value="3" variant="warning" />
        <StatBox label="Contacts" value="12" />
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>// ACTIONS</Text>

        <Link href="/scan" asChild>
          <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]}>
            <Text style={styles.actionTitle}>SCANNER</Text>
            <Text style={styles.actionDesc}>QR code ou ISBN</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/loans/new" asChild>
          <TouchableOpacity style={[styles.actionButton, styles.actionSecondary]}>
            <Text style={styles.actionTitle}>NOUVEAU PRET</Text>
            <Text style={styles.actionDesc}>Preter un objet</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/collections/new" asChild>
          <TouchableOpacity style={[styles.actionButton, styles.actionAccent]}>
            <Text style={styles.actionTitle}>AJOUTER</Text>
            <Text style={styles.actionDesc}>Nouvel objet</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Objets pretés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>// RETOURS RECENTS</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun pret recent</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Boîte statistique.
 */
function StatBox({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
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
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
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
