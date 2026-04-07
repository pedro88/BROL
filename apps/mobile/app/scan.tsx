/**
 * Écran Scanner QR code.
 * @package @brol/mobile
 */

import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography } from "../src/theme";

/**
 * Écran de scan QR code.
 * @note Scanner désactivé pour l'instant - nécessite expo-camera configuré.
 */
export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);

  /**
   * Gère le scan d'un QR code.
   * @note Fonctionnalité à implémenter après configuration expo-camera.
   */
  const handleScan = (data: string) => {
    if (scanned) return;
    setScanned(true);

    // Parser l'URL scannée
    try {
      const url = new URL(data);
      const path = url.pathname;

      // QR objet: /s/{id}
      const objectMatch = path.match(/^\/s\/([a-zA-Z0-9]+)$/);
      if (objectMatch && objectMatch[1]) {
        router.push(`/objects/${objectMatch[1]}`);
        return;
      }

      // QR profil: /p/{id}
      const profileMatch = path.match(/^\/p\/([a-zA-Z0-9]+)$/);
      if (profileMatch && profileMatch[1]) {
        router.push(`/contacts/add?userId=${profileMatch[1]}`);
        return;
      }

      // Code stock: juste le code
      router.push(`/objects/scan?code=${data}`);
    } catch {
      // Ce n'est pas une URL, c'est peut-être un code direct
      router.push(`/objects/scan?code=${data}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Placeholder pour le scanner */}
      <View style={styles.placeholder}>
        <Text style={styles.title}>SCANNER</Text>
        <Text style={styles.subtitle}>
          Pointez vers un QR code pour scanner
        </Text>

        {/* Zone de scan simulée */}
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <Text style={styles.hint}>
          Configuration expo-camera requise
        </Text>
      </View>

      <View style={styles.footer}>
        {scanned && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>SCANNER A NOUVEAU</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 32,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
    marginVertical: spacing.xl,
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  hint: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  footer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primaryForeground,
    fontWeight: "bold",
  },
});
