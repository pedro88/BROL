/**
 * Root layout for the mobile app.
 * Wraps with TRPCProvider and handles auth-aware routing.
 *
 * Auth flow:
 * - On mount: syncSession() to restore session from secure storage
 * - If authenticated + on /sign-in or /sign-up: redirect to /home
 * - If not authenticated + on (tabs) routes: redirect to /sign-in
 *
 * @package @brol/mobile
 */

import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { TRPCProvider } from "../src/lib/trpc-provider";
import { syncSession } from "../src/lib/session-sync";
import { authAtom } from "../src/lib/auth-store";
import { useAuth } from "../src/lib/use-auth";
import { colors } from "../src/theme";

/**
 * Auth screen paths (not inside tabs group).
 */
const AUTH_SCREENS = ["sign-in", "sign-up"];

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

    // Get the first segment (top-level route)
    const firstSegment = segments[0] ?? "";

    // Check if we're on an auth screen
    const isAuthScreen = AUTH_SCREENS.includes(firstSegment);

    // Check if we're inside the tabs group
    const isTabScreen = firstSegment === "(tabs)";

    console.log("[root-layout] Route check:", {
      isAuthenticated,
      firstSegment,
      isAuthScreen,
      isTabScreen,
    });

    if (!isAuthenticated && isTabScreen) {
      // Not authenticated and trying to access protected route (tabs)
      console.log("[root-layout] Not authenticated, redirecting to /sign-in");
      router.replace("/sign-in");
    } else if (isAuthenticated && isAuthScreen) {
      // Authenticated and on auth screen — redirect to home
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
        {/* Auth screens — always accessible */}
        <Stack.Screen name="sign-in" options={{ title: "Connexion" }} />
        <Stack.Screen name="sign-up" options={{ title: "Créer un compte" }} />

        {/* Protected tab screens */}
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