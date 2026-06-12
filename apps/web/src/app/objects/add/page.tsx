"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { ObjectForm } from "../../../components/objects/object-form";
import { trpc } from "../../../lib/trpc";
import { Button } from "../../../components/ui/button";

/**
 * Inner component that uses useSearchParams.
 * Must be wrapped in Suspense for static generation.
 */
function AddObjectForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionId = searchParams.get("collectionId");
  const utils = trpc.useUtils();

  const { data: collectionsData } = trpc.collections.list.useQuery();
  const hasCollections = (collectionsData?.items.length ?? 0) > 0;

  if (!collectionId && !hasCollections) {
    return (
      <>
        {/* Back button */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            {t("objects.addTitle")}
          </h1>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">
            {t("collections.noCollections")}
          </h2>
          <p className="font-mono text-sm text-muted-foreground mb-6 max-w-xs">
            {t("objects.addRequiresCollection")}
          </p>
          <Button
            onClick={() => router.push("/collections/new")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("collections.create")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Back button */}
      <Link
        href={collectionId ? `/collections/${collectionId}` : "/collections"}
        className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("common.back")}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl vhs-text-glow text-primary">
          {t("objects.addTitle")}
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          {t("objects.addDescription")}
        </p>
      </div>

      {/* Form */}
      <ObjectForm
        collectionId={collectionId ?? undefined}
        onSuccess={(newObject) => {
          if (newObject?.collectionId) {
            utils.collections.get.invalidate({ id: newObject.collectionId });
            router.push(`/collections/${newObject.collectionId}`);
          } else if (collectionId) {
            utils.collections.get.invalidate({ id: collectionId });
          }
        }}
      />
    </>
  );
}

/**
 * Page d'ajout d'un objet.
 * Wrapped in Suspense for useSearchParams compatibility.
 */
export default function AddObjectPage() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="spinner-vhs w-8 h-8" />
            </div>
          }
        >
          <AddObjectForm />
        </Suspense>
      </main>

      <Navigation />
    </div>
  );
}
