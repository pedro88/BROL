/**
 * Sign-in screen for the mobile app.
 * Email + password form using BetterAuth auth.
 * @package @brol/mobile
 */

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { colors, spacing, typography } from "../src/theme";
import { signInEmailPassword } from "../src/lib/auth-client";
import { setAuth } from "../src/lib/auth-store";
import { setItem } from "../src/lib/secure-storage";

/**
 * Sign-in screen.
 * Accessible without auth (no route guard on /sign-in).
 * Redirects to /home on successful sign-in.
 */
export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signInEmailPassword(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.sessionToken && result.user) {
        // Store token in secure storage
        await setItem("sessionToken", result.sessionToken);
        // Update auth atom
        setAuth(result.sessionToken, result.user);
        // Navigate to home
        router.replace("/");
      } else {
        setError("Réponse inattendue du serveur");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BROL</Text>
          <Text style={styles.subtitle}>&gt; Connexion _</Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>CONNEXION</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link to sign-up */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logo: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 48,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
  errorBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.accent,
    textAlign: "center",
  },
  form: {
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.foreground,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primaryForeground,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  linkText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});