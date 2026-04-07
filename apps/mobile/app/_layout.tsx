/**
 * Layout principal de l'application Expo.
 * @package @brol/mobile
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme";

/**
 * Layout racine avec navigation stack.
 * Utilise expo-router pour le routing file-based.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "Courier",
            fontWeight: "bold" as const,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "BROL",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="collections"
          options={{
            title: "// COLLECTIONS",
          }}
        />
        <Stack.Screen
          name="loans"
          options={{
            title: "// PRETS",
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: "// SCANNER",
          }}
        />
      </Stack>
    </>
  );
}
