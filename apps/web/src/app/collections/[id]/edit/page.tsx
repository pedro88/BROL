"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation } from "../../../../components/navigation";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { trpc } from "../../../../lib/trpc";
import { OBJECT_TYPES } from "@brol/shared";

type ObjectType = (typeof OBJECT_TYPES)[number];

/**
 * Page d'édition d'une collection.
 */
export default function EditCollectionPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  // Fetch collection
  const { data: collection, isLoading } = trpc.collections.get.useQuery(
    { id: collectionId },
    { enabled: !!collectionId }
  );
  const utils = trpc.useUtils();

  // Local state for isPublic (initialized from collection data)
  const [isPublic, setIsPublic] = useState(false);
  const [collectionType, setCollectionType] = useState<ObjectType>("BOOK");
  const [customField1Label, setCustomField1Label] = useState("Champ libre 1");
  const [customField2Label, setCustomField2Label] = useState("Champ libre 2");
  const [selfServiceEnabled, setSelfServiceEnabled] = useState(false);

  // Sync state when collection loads
  useEffect(() => {
    if (collection) {
      const ssm = (collection as { selfServiceMode?: string }).selfServiceMode ?? "OFF";
      setIsPublic(collection.isPublic ?? false);
      setCollectionType((collection.type as ObjectType) ?? "BOOK");
      setCustomField1Label(collection.customField1Label ?? "Champ libre 1");
      setCustomField2Label(collection.customField2Label ?? "Champ libre 2");
      setSelfServiceEnabled(ssm === "CONTACTS");
    }
  }, [collection]);

  // Update mutation
  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      utils.collections.get.invalidate({ id: collectionId });
      router.push(`/collections/${collectionId}`);
    },
    onError: (err) => {
      console.error("Update failed:", err);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: collectionId,
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string || undefined,
        isPublic,
        type: collectionType,
        customField1Label: collectionType === "CUSTOM" ? customField1Label : undefined,
        customField2Label: collectionType === "CUSTOM" ? customField2Label : undefined,
        selfServiceMode: selfServiceEnabled ? "CONTACTS" : "OFF",
      },
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/collections/${collectionId}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("collections.label")}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            {t("common.editLabel")}
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            {t("collections.editDescription")}
          </p>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        ) : collection ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-mono text-xs uppercase">
                {t("common.nameRequired")}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={collection.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono text-xs uppercase">
                {t("collections.description")}
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={collection.description ?? ""}
              />
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <Label htmlFor="type" className="font-mono text-xs uppercase">
                {t("collections.typeOfObjects")}
              </Label>
              <select
                id="type"
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value as ObjectType)}
                className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {OBJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`collections.typeLabel.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom field labels — only for CUSTOM type */}
            {collectionType === "CUSTOM" && (
              <div className="space-y-2 border border-dashed border-border p-3">
                <p className="font-mono text-xs text-muted-foreground">
                  {t("collections.customFieldsHint")}
                </p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="customField1Label" className="font-mono text-xs uppercase">
                      {t("collections.customField1Label")}
                    </Label>
                    <Input
                      id="customField1Label"
                      value={customField1Label}
                      onChange={(e) => setCustomField1Label(e.target.value)}
                      placeholder={t("collections.customField1Label")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customField2Label" className="font-mono text-xs uppercase">
                      {t("collections.customField2Label")}
                    </Label>
                    <Input
                      id="customField2Label"
                      value={customField2Label}
                      onChange={(e) => setCustomField2Label(e.target.value)}
                      placeholder={t("collections.customField2Label")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* isPublic toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="isPublic" className="font-mono text-xs uppercase">
                  {t("collections.isPublic")}
                </Label>
                <p className="font-mono text-xs text-muted-foreground">
                  {t("collections.publicDescription")}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {/* Self-service toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="selfService" className="font-mono text-xs uppercase">
                  Auto-prêt par contacts
                </Label>
                <p className="font-mono text-xs text-muted-foreground">
                  Permet à vos contacts de s'auto-emprunter les objets.
                </p>
              </div>
              <Switch
                id="selfService"
                checked={selfServiceEnabled}
                onCheckedChange={setSelfServiceEnabled}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        ) : (
          <p className="font-mono text-muted-foreground">{t("collections.notFoundShort")}</p>
        )}
      </main>

      <Navigation />
    </div>
  );
}
