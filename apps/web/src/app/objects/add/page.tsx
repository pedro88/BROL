"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { ObjectForm } from "../../../components/objects/object-form";
import { trpc } from "../../../lib/trpc";

/**
 * Inner component that uses useSearchParams.
 * Must be wrapped in Suspense for static generation.
 */
function AddObjectForm() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collectionId");
  const utils = trpc.useUtils();

  return (
    <>
      {/* Back button */}
      <Link
        href={collectionId ? `/collections/${collectionId}` : "/collections"}
        className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl vhs-text-glow text-primary">
          AJOUTER UN OBJET
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Ajoutez un nouvel objet à votre collection
        </p>
      </div>

      {/* Form */}
      <ObjectForm
        collectionId={collectionId ?? undefined}
        onSuccess={() => {
          if (collectionId) {
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
