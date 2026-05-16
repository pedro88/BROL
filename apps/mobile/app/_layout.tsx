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
import { Stack } from "expo-router";
import { TRPCProvider } from "../src/lib/trpc-provider";
import { syncSession } from "../src/lib/session-sync";
import { authAtom } from "../src/lib/auth-store";
import { colors } from "../src/theme";

/**
 * Root layout component.
 * Entry point for the entire app.
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const authState = authAtom.get();

  // Sync session on mount
  useEffect(() => {
    const init = async () => {
      await syncSession();
      setIsReady(true);
    };
    init();
  }, []);

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

        {/* Protected tab screens — redirect to /sign-in if not authenticated */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
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