/**
 * Root layout for the mobile app.
 * Wraps with TRPCProvider and handles auth-aware routing.
 *
 * Auth flow:
 * - On mount: syncSession() to restore session from secure storage
 * - If authenticated + on /sign-in or /sign-up: redirect to /home
 * - If not authenticated + on tab routes: redirect to /sign-in
 *
 * @package @brol/mobile
 */

import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { TRPCProvider } from "../src/lib/trpc-provider";
import { syncSession } from "../src/lib/session-sync";
import { useAuth } from "../src/lib/use-auth";
import { colors } from "../src/theme";

/**
 * Routes that are considered auth screens (not protected).
 */
const AUTH_ROUTES = ["sign-in", "sign-up"];

/**
 * Routes that are inside the protected tab group.
 * These require authentication.
 */
const PROTECTED_ROUTES = ["home", "collections", "objects", "loans", "profile"];

/**
 * Root layout component.
 * Entry point for the entire app.
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { user, sessionToken } = useAuth();

  // Sync session on mount
  useEffect(() => {
    const init = async () => {
      console.log("[root-layout] Starting session sync...");
      await syncSession();
      console.log("[root-layout] Session synced");
      setIsReady(true);
    };
    init();
  }, []);

  // Route guard
  useEffect(() => {
    if (!isReady) return;

    const isAuthenticated = user !== null && sessionToken !== null;
    const firstSegment = segments[0] ?? "";

    // If we're on a protected route without auth, redirect to sign-in
    if (!isAuthenticated && PROTECTED_ROUTES.includes(firstSegment)) {
      console.log("[root-layout] Not authenticated, redirecting to /sign-in");
      router.replace("/sign-in");
      return;
    }

    // If authenticated and on auth screen, redirect to home
    if (isAuthenticated && AUTH_ROUTES.includes(firstSegment)) {
      console.log("[root-layout] Authenticated, on auth screen, redirecting to /home");
      router.replace("/home");
    }
  }, [isReady, user, sessionToken, segments]);

  // Show splash while initializing
  if (!isReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <TRPCProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="sign-in" options={{ title: "Connexion" }} />
        <Stack.Screen name="sign-up" options={{ title: "Créer un compte" }} />

        {/* Protected tab screens — will redirect to /sign-in if not authenticated */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Stack screens for create/edit flows */}
        <Stack.Screen name="scan" options={{ title: "Scanner" }} />
        <Stack.Screen name="loans/new" options={{ title: "Nouveau prêt" }} />
        <Stack.Screen name="objects/add" options={{ title: "Ajouter un objet" }} />
        <Stack.Screen name="collections/new" options={{ title: "Nouvelle collection" }} />
      </Stack>
    </TRPCProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});