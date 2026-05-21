/**
 * Sign-up screen for the mobile app.
 * Email + password + name form using BetterAuth auth.
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
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { colors, spacing, typography } from "../src/theme";
import { signUpEmailPassword } from "../src/lib/auth-client";
import { setAuth } from "../src/lib/auth-store";
import { setSessionToken } from "../src/lib/secure-storage";

/**
 * Sign-up screen.
 * Accessible without auth (no route guard on /sign-up).
 * Redirects to /home on successful sign-up.
 */
export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUpEmailPassword(email.trim(), password, name.trim());

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.sessionToken && result.user) {
        // Store token in secure storage
        await setSessionToken(result.sessionToken);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BROL</Text>
          <Text style={styles.subtitle}>&gt; Créer un compte _</Text>
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
            <Text style={styles.label}>NOM</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jean Dupont"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              editable={!isLoading}
            />
          </View>

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
              placeholder="8 caractères minimum"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CONFIRMER</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez le mot de passe"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>CRÉER UN COMPTE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link to sign-in */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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