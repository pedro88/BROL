/**
 * Card — conteneur VHS avec bordure cyan glow.
 * @package @brol/mobile
 */

import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  onPress,
  style,
  glow,
  padding = "md",
}: CardProps) {
  const content = (
    <View
      style={[
        styles.base,
        glow && styles.glow,
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  glow: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: { opacity: 0.85 },
});
