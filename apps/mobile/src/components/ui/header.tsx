/**
 * Header — barre supérieure : titre + bouton retour + slot droite.
 * @package @brol/mobile
 */

import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export function Header({ title, showBack, rightSlot }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Text style={styles.backIcon}>{"<"}</Text>
          </Pressable>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.5 },
  backIcon: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 22,
  },
  title: {
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 2,
    flex: 1,
  },
});
