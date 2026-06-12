/**
 * /notifications — liste des notifications de l'utilisateur.
 * @package @brol/mobile
 */

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Card } from "../src/components/ui/card";
import { EmptyState } from "../src/components/ui/empty-state";
import { Header } from "../src/components/ui/header";
import { Spinner } from "../src/components/ui/spinner";
import { trpc } from "../src/lib/trpc";
import { colors, spacing, typography } from "../src/theme";

function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsScreen() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.notification.list.useQuery({ limit: 50 });

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        rightSlot={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
            >
              Tout lire
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <Spinner fullScreen />
      ) : items.length === 0 ? (
        <EmptyState
          icon="[N]"
          title="Aucune notification"
          description="Vos notifications apparaîtront ici."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {items.map((notif) => (
            <Card
              key={notif.id}
              onPress={
                notif.isRead
                  ? undefined
                  : () => markRead.mutate({ id: notif.id })
              }
              style={[
                styles.card,
                !notif.isRead && styles.cardUnread,
              ]}
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>{notif.title}</Text>
                {!notif.isRead && <Badge variant="primary">Nouveau</Badge>}
              </View>
              {notif.message ? (
                <Text style={styles.message}>{notif.message}</Text>
              ) : null}
              <Text style={styles.date}>{formatRelativeDate(notif.createdAt)}</Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    gap: spacing.xs,
  },
  cardUnread: {
    borderColor: colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 14,
    flex: 1,
  },
  message: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  date: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    marginTop: spacing.xs,
  },
});
