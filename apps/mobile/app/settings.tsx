/**
 * /settings — handle + QR + tier (read-only au Milestone 1).
 * @package @brol/mobile
 */

import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { QrDisplay } from "../src/components/qr-display";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Card } from "../src/components/ui/card";
import { Header } from "../src/components/ui/header";
import { Spinner } from "../src/components/ui/spinner";
import { trpc } from "../src/lib/trpc";
import { colors, spacing, typography } from "../src/theme";

const TIER_LABELS: Record<string, { name: string; price: string }> = {
  FREE: { name: "Free", price: "0€" },
  TIER_2: { name: "Tier 2", price: "3€/mois" },
  TIER_3: { name: "Tier 3", price: "20€/mois" },
};

function ProgressBar({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number | null;
}) {
  const isUnlimited = max === null;
  const percent = isUnlimited ? 100 : Math.min((current / max) * 100, 100);
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {isUnlimited ? "∞" : `${current}/${max}`}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { data: tierData, isLoading: tierLoading } = trpc.tier.getLimits.useQuery();
  const { data: me, isLoading: meLoading } = trpc.users.me.useQuery();

  const [showQr, setShowQr] = useState(false);

  const handle = me?.handle ?? null;
  const profileUrl = handle
    ? `${process.env.EXPO_PUBLIC_APP_URL ?? "https://brol.app"}/profile/${handle}`
    : "";

  const copyHandle = async () => {
    if (!handle) return;
    await Clipboard.setStringAsync(`#${handle}`);
    Alert.alert("Copié", `#${handle} copié dans le presse-papier.`);
  };

  if (tierLoading || meLoading) {
    return (
      <View style={styles.container}>
        <Header title="Paramètres" showBack />
        <Spinner fullScreen />
      </View>
    );
  }

  const currentTier = tierData?.tier ?? "FREE";
  const tierInfo = TIER_LABELS[currentTier] ?? TIER_LABELS.FREE;
  const limits = tierData?.limits;

  return (
    <View style={styles.container}>
      <Header title="Paramètres" showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Mon Profil */}
        <Card>
          <Text style={styles.sectionTitle}>Mon Profil</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(me?.name ?? me?.email ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{me?.name ?? "Sans nom"}</Text>
              <Text style={styles.email}>{me?.email}</Text>
            </View>
          </View>

          {/* Mon identifiant */}
          {handle && (
            <View style={styles.handleSection}>
              <Text style={styles.label}>Mon identifiant</Text>
              <View style={styles.handleRow}>
                <Text style={styles.handleText}>#{handle}</Text>
                <View style={styles.handleActions}>
                  <Button variant="outline" size="sm" onPress={copyHandle}>
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowQr((v) => !v)}
                  >
                    {showQr ? "Masquer QR" : "QR"}
                  </Button>
                </View>
              </View>
              {showQr && (
                <View style={styles.qrWrap}>
                  <QrDisplay data={profileUrl} size={200} />
                  <Text style={styles.qrCaption}>
                    Scannez pour m&apos;ajouter
                  </Text>
                </View>
              )}
              <Button
                variant="ghost"
                size="sm"
                onPress={() =>
                  Alert.alert(
                    "Bientôt disponible",
                    "L'édition du pseudo arrive au prochain milestone.",
                  )
                }
              >
                Modifier le pseudo
              </Button>
            </View>
          )}
        </Card>

        {/* Mon Plan */}
        <Card>
          <View style={styles.tierHeader}>
            <Text style={styles.sectionTitle}>Mon Plan</Text>
            <Badge variant={currentTier === "FREE" ? "default" : "primary"}>
              {tierInfo.name} · {tierInfo.price}
            </Badge>
          </View>

          {limits && (
            <View style={styles.progressList}>
              <ProgressBar
                label="Collections"
                current={limits.collections.current}
                max={limits.collections.max}
              />
              <ProgressBar
                label="Objets"
                current={limits.objects.current}
                max={limits.objects.max}
              />
              <ProgressBar
                label="Prêts actifs"
                current={limits.activeLoans.current}
                max={limits.activeLoans.max}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, gap: spacing.md },
  sectionTitle: {
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,0,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 20,
  },
  name: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
  },
  email: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  handleSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  label: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  handleText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 20,
  },
  handleActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  qrWrap: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  qrCaption: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  progressList: { gap: spacing.md },
  progressRow: { gap: spacing.xs },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  progressValue: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
});
