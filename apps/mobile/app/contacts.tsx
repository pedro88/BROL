/**
 * /contacts — liste des contacts avec recherche.
 * @package @brol/mobile
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Card } from "../src/components/ui/card";
import { EmptyState } from "../src/components/ui/empty-state";
import { Header } from "../src/components/ui/header";
import { Input } from "../src/components/ui/input";
import { Spinner } from "../src/components/ui/spinner";
import { trpc } from "../src/lib/trpc";
import { colors, spacing, typography } from "../src/theme";

export default function ContactsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.contacts.list.useQuery({
    search: search || undefined,
    limit: 100,
  });

  const items = data?.items ?? [];

  return (
    <View style={styles.container}>
      <Header
        title="Contacts"
        showBack
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            onPress={() =>
              Alert.alert(
                "Bientôt disponible",
                "La création de contact mobile arrive au prochain milestone.",
              )
            }
          >
            +
          </Button>
        }
      />

      <View style={styles.searchWrap}>
        <Input
          placeholder="Rechercher un contact..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <Spinner fullScreen />
      ) : items.length === 0 ? (
        <EmptyState
          icon="[C]"
          title="Aucun contact"
          description={
            search ? "Aucun contact ne correspond." : "Ajoutez votre premier contact depuis le web."
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                Alert.alert(
                  "Bientôt disponible",
                  "Le détail contact mobile arrive au prochain milestone.",
                )
              }
              style={styles.contactCard}
            >
              <View style={styles.contactRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {(item.email || item.phone) && (
                    <Text style={styles.secondary}>
                      {item.email ?? item.phone}
                    </Text>
                  )}
                </View>
                {item.borrowerId && (
                  <Badge variant="secondary">Brol</Badge>
                )}
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  contactCard: {
    marginBottom: spacing.xs,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.secondary,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
  },
  name: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 14,
  },
  secondary: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
});
