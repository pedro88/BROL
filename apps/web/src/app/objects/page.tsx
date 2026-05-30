"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Package, User, Clock, ChevronRight } from "lucide-react";
import { Header, Navigation } from "../../components/navigation";
import { Input } from "../../components/ui/input";
import { trpc } from "../../lib/trpc";

const conditionLabels: Record<string, string> = {
  NEW: "Neuf",
  LIKE_NEW: "Comme neuf",
  GOOD: "Bon",
  FAIR: "Correct",
  POOR: "Mauvais",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type StatusFilter = "all" | "available" | "lent" | "borrowed";

interface FilterState {
  collectionId: string;
  status: StatusFilter;
  search: string;
}

function ObjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    collectionId: searchParams.get("collectionId") ?? "",
    status: (searchParams.get("status") as StatusFilter) ?? "all",
    search: searchParams.get("q") ?? "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Collections pour le filtre
  const { data: collectionsData } = trpc.collections.list.useQuery();
  const collections = collectionsData?.items ?? [];

  // Objets
  const { data, isLoading } = trpc.objects.all.useQuery({
    collectionId: filters.collectionId || undefined,
    status: filters.status,
    search: filters.search || undefined,
    limit: 100,
  });

  const objects = data?.items ?? [];

  // Sync URL params
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.collectionId) params.set("collectionId", newFilters.collectionId);
    if (newFilters.status !== "all") params.set("status", newFilters.status);
    if (newFilters.search) params.set("q", newFilters.search);
    const qs = params.toString();
    router.push(`/objects${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({ collectionId: "", status: "all", search: "" });
    router.push("/objects", { scroll: false });
  };

  const hasFilters = filters.collectionId || filters.status !== "all" || filters.search;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            MES OBJETS
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {isLoading
              ? "Chargement..."
              : `${objects.length} objet${objects.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un objet..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-mono border transition-colors ${
              showFilters || hasFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                •
              </span>
            )}
          </button>

          {/* Expanded filters */}
          {showFilters && (
            <div className="card-vhs p-4 space-y-3">
              <div className="space-y-1">
                <label className="font-mono text-xs text-muted-foreground uppercase">
                  Collection
                </label>
                <select
                  value={filters.collectionId}
                  onChange={(e) => handleFilterChange("collectionId", e.target.value)}
                  className="w-full bg-input border-2 border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Toutes les collections</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs text-muted-foreground uppercase">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["all", "available", "lent", "borrowed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange("status", status)}
                      className={`py-2 px-3 text-xs font-mono border transition-colors ${
                        filters.status === status
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {status === "all"
                        ? "Tous"
                        : status === "available"
                          ? "Disponible"
                          : status === "lent"
                            ? "Prêté"
                            : "Emprunté"}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full text-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tableau */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        ) : objects.length === 0 ? (
          <div className="card-vhs p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              AUCUN OBJET
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              {hasFilters
                ? "Aucun objet ne correspond aux filtres."
                : "Ajoutez votre premier objet dans une collection."}
            </p>
            {!hasFilters && (
              <Link
                href="/objects/add"
                className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm"
              >
                Ajouter un objet
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header du tableau */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 font-mono text-xs text-muted-foreground uppercase">
              <div className="col-span-4">Nom</div>
              <div className="col-span-3">Collection</div>
              <div className="col-span-2">État</div>
              <div className="col-span-3">Status</div>
            </div>

            {objects.map((obj) => {
              const isBorrowedView = !!obj.owner;
              const isLent = !isBorrowedView && !!obj.currentLoan;
              const isOverdue = obj.currentLoan?.isOverdue;

              return (
                <Link
                  key={obj.id}
                  href={`/objects/${obj.id}`}
                  className={`card-vhs p-4 block hover:border-primary/50 transition-colors ${
                    isOverdue ? "border-destructive/50" : ""
                  }`}
                >
                  {/* Mobile card view */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {obj.coverImage ? (
                        <img
                          src={obj.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium truncate">
                        {obj.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground truncate">
                        {obj.collection.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono ${
                          isBorrowedView
                            ? isOverdue
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/10 text-accent"
                            : isLent
                              ? isOverdue
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                              : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {isBorrowedView
                          ? isOverdue
                            ? "En retard"
                            : "Emprunté"
                          : isLent
                            ? isOverdue
                              ? "En retard"
                              : "Prêté"
                            : "Disponible"}
                      </span>
                      {isBorrowedView && obj.owner ? (
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          ← {obj.owner.name ?? "Inconnu"}
                          {obj.owner.handle ? ` #${obj.owner.handle}` : ""}
                        </span>
                      ) : obj.currentLoan ? (
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {obj.currentLoan.borrower?.name ?? "Inconnu"}
                        </span>
                      ) : null}
                      {(isBorrowedView || isLent) && obj.currentLoan?.returnDueDate && (
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(obj.currentLoan.returnDueDate)}
                        </span>
                      )}
                      <span className="font-mono text-xs text-muted-foreground">
                        {conditionLabels[obj.condition] ?? obj.condition}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}

export default function ObjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pb-20">
          <Header />
          <main className="px-4 py-6 max-w-lg mx-auto flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </main>
          <Navigation />
        </div>
      }
    >
      <ObjectsContent />
    </Suspense>
  );
}