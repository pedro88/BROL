/**
 * Tab navigation layout.
 * 5 tabs: Home, Collections, Objects, Loans, Profile.
 * All tabs are protected (require auth).
 *
 * @package @brol/mobile
 */

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../src/theme";

/**
 * Tab icon component.
 */
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "[H]",
    collections: "[C]",
    objects: "[O]",
    loans: "[L]",
    profile: "[P]",
  };

  return (
    <View style={styles.tabIcon}>
      <Text
        style={[
          styles.iconText,
          { color: focused ? colors.primary : colors.mutedForeground },
        ]}
      >
        {icons[label] ?? "?"}
      </Text>
    </View>
  );
}

/**
 * Tab layout — renders 5 tabs at the bottom of the screen.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm,
          height: 70,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 10,
          letterSpacing: 1,
        },
      }}
    >
      {/* Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ focused }) => <TabIcon label="home" focused={focused} />,
        }}
      />

      {/* Collections */}
      <Tabs.Screen
        name="collections"
        options={{
          title: "COLLECT",
          tabBarIcon: ({ focused }) => <TabIcon label="collections" focused={focused} />,
        }}
      />

      {/* Objects */}
      <Tabs.Screen
        name="objects"
        options={{
          title: "OBJETS",
          tabBarIcon: ({ focused }) => <TabIcon label="objects" focused={focused} />,
        }}
      />

      {/* Loans */}
      <Tabs.Screen
        name="loans"
        options={{
          title: "PRETS",
          tabBarIcon: ({ focused }) => <TabIcon label="loans" focused={focused} />,
        }}
      />

      {/* Profile / Settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFIL",
          tabBarIcon: ({ focused }) => <TabIcon label="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  iconText: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
  },
});