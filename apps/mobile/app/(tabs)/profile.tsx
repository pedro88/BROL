/**
 * Profile / Settings screen (tab).
 * @package @brol/mobile
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/lib/use-auth";
import { signOut } from "../../src/lib/sign-out";
import { colors, spacing, typography } from "../../src/theme";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROFIL</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name ?? "User"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>// COMPTE</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Aide</Text>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={signOut}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>DECONNEXION</Text>
      </TouchableOpacity>
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
  userCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 28,
    color: colors.primaryForeground,
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  menuItem: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  menuText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.foreground,
  },
  logoutButton: {
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  logoutText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 1,
  },
});