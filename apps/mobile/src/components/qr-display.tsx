/**
 * QrDisplay — affiche un QR code via api.qrserver.com.
 * Pas de dépendance native, juste une Image distante.
 * Aligné sur le pattern web `apps/web/src/components/qr/qr-code-image.tsx`.
 *
 * @package @brol/mobile
 */

import { Image, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";

interface QrDisplayProps {
  /** Donnée à encoder (souvent une URL `https://.../profile/{handle}` ou `/qr/{code}`). */
  data: string;
  /** Taille en px (logique) du QR. */
  size?: number;
}

export function QrDisplay({ data, size = 200 }: QrDisplayProps) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    data,
  )}&size=${size}x${size}&margin=0`;
  return (
    <View style={[styles.wrapper, { padding: spacing.sm }]}>
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size }}
        accessibilityLabel="QR code"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ffffff",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "center",
  },
});
