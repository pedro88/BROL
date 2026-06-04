/**
 * Page de détail d'une collection.
 * Affiche les informations de la collection et ses objets.
 * Accessible publiquement si la collection estPublic = true.
 *
 * @package @brol/web
 */

"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, Pencil, Trash2, Globe } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { ObjectCard } from "../../../components/objects/object-card";
import { trpc } from "../../../lib/trpc";

// Transform a private collection object (with loans) to ObjectCard format
function transformPrivateObject(obj: {
  id: string;
  name: string;
  author: string | null;
  coverImage: string | null;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  loans?: {
    id: string;
    status: string;
    borrower?: { id: string; name: string | null; image: string | null };
    returnDueDate?: Date;
  }[];
}) {
  const activeLoan = obj.loans?.find((l) => l.status === "ACTIVE");
  return {
    id: obj.id,
    name: obj.name,
    author: obj.author,
    coverImage: obj.coverImage,
    condition: obj.condition,
    currentLoan: activeLoan
      ? {
          id: activeLoan.id,
          borrower: activeLoan.borrower,
          returnDueDate: activeLoan.returnDueDate?.toISOString(),
        }
      : null,
  };
}

// Transform a public collection object (no loans) to ObjectCard format
function transformPublicObject(obj: {
  id: string;
  name: string;
  author: string | null;
  coverImage: string | null;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
}) {
  return {
    id: obj.id,
    name: obj.name,
    author: obj.author,
    coverImage: obj.coverImage,
    condition: obj.condition,
    currentLoan: null,
  };
}

/**
 * Page de détail d'une collection.
 */
export default function CollectionDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const collectionId = params.id as string;

  // Always enable both queries — they run in parallel and each returns
  // based on auth context (cookie). The private query returns data if the
  // user owns the collection; the public query returns data if it's public.
  // This avoids the useState caching issue where signIn state wasn't reflected.
  const { data: collection, isFetching: isFetchingAuth } =
    trpc.collections.get.useQuery(
      { id: collectionId },
      { enabled: !!collectionId, staleTime: 0 },
    );

  // Requête publique (collections publiques)
  const { data: publicCollection, isFetching: isFetchingPublic } =
    trpc.collections.getPublic.useQuery(
      { id: collectionId },
      { enabled: !!collectionId, staleTime: 0 },
    );

  // isLoading reflète l'état de chargement effectif (au moins une requête en cours)
  const isLoading = isFetchingAuth || isFetchingPublic;

  // Authenticated view if the private query returned data
  const isAuthenticated = !!collection;

  // Use authenticated collection data or public data
  const collectionData = isAuthenticated ? collection : publicCollection;

  // Owner name — source differs between public and private views
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerName = isAuthenticated
    ? (collectionData as any)?.user?.name
    : (collectionData as any)?.ownerName;

  const isEmptyCollection = !isLoading && !collectionData;
  const isPublicAccess = !isAuthenticated && isEmptyCollection;

  // Pour les données privées, on transforme les objets
  // Transform objects to ObjectCard format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objects: any[] = collectionData
    ? isAuthenticated
      ? ((collectionData as any).objects?.map(transformPrivateObject) ?? [])
      : ((collectionData as any).objects?.map(transformPublicObject) ?? [])
    : [];

  const loanedCount = objects.filter((o) => o.currentLoan).length;

  // Empty/not-found state
  if (isEmptyCollection) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nav.collections")}
          </Link>

          <div className="card-vhs p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              {t("collections.notFound")}
            </h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              {t("collections.notFoundDescription")}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/browse">
                  <Globe className="w-4 h-4 mr-2" />
                  {t("collections.viewPublic")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sign-in?callbackUrl=/collections">
                  {t("auth.submitSignIn")}
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  // Pas connecté mais collection publique
  if (isPublicAccess) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("collections.publicCollections")}
          </Link>

          <div className="card-vhs p-8 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              {t("collections.public")}
            </h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              {t("collections.publicSignInPrompt")}
            </p>
            <Button asChild>
              <Link href="/sign-in?callbackUrl=/collections">{t("auth.submitSignIn")}</Link>
            </Button>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={isAuthenticated ? "/collections" : "/browse"}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAuthenticated ? t("nav.collections") : t("collections.publicCollections")}
        </Link>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Collection content */}
        {!isLoading && collectionData && (
          <>
            {/* Collection header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-display text-3xl vhs-text-glow text-primary">
                    {collectionData.name}
                    {"type" in collectionData && collectionData.type && (
                      <span className="ml-3 font-mono text-sm bg-secondary/20 text-secondary border border-secondary/30 px-2 py-1">
                        {collectionData.type}
                      </span>
                    )}
                  </h1>
                  {collectionData.description && (
                    <p className="font-mono text-sm text-muted-foreground mt-2">
                      {collectionData.description}
                    </p>
                  )}
                  {ownerName && (
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {t("collections.byOwner", { name: ownerName })}
                    </p>
                  )}
                </div>

                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/collections/${collectionId}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-4">
                <div className="card-vhs px-4 py-2">
                  <span className="font-display text-2xl text-primary">
                    {objects.length}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground ml-2">
                    {t("objects.labelPlural")}
                  </span>
                </div>
                {isAuthenticated && loanedCount > 0 && (
                  <div className="card-vhs px-4 py-2">
                    <span className="font-display text-2xl text-secondary">
                      {loanedCount}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground ml-2">
                      {t("collections.lentOut")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add object button (authenticated only) */}
            {isAuthenticated && (
              <div className="mb-4">
                <Button asChild className="w-full">
                  <Link href={`/objects/add?collectionId=${collectionId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("objects.add")}
                  </Link>
                </Button>
              </div>
            )}

            {/* Objects list */}
            {objects.length === 0 && (
              <div className="card-vhs p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="font-display text-xl text-muted-foreground mb-2">
                  {t("objects.empty")}
                </h2>
                <p className="font-mono text-sm text-muted-foreground">
                  {isAuthenticated
                    ? t("objects.emptyDescription")
                    : t("collections.emptyNoAuth")}
                </p>
              </div>
            )}

            {objects.length > 0 && (
              <div className="space-y-3">
                {objects.map((object) => (
                  <ObjectCard
                    key={object.id}
                    id={object.id}
                    name={object.name}
                    author={object.author}
                    coverImage={object.coverImage}
                    condition={object.condition}
                    currentLoan={object.currentLoan}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
}
