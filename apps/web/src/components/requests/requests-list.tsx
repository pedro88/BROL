"use client";

import { useState } from "react";
import { RequestCard } from "./request-card";
import { CreateRequestDialog } from "./create-request-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Search } from "lucide-react";

export function RequestsList() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.communityRequest.list.useInfiniteQuery(
      { search: search || undefined, limit: 20 },
      {
        getNextPageParam: (last) => last.nextCursor,
      }
    );

  const createRequest = trpc.communityRequest.create.useMutation({
    onSuccess: () => {
      utils.communityRequest.list.invalidate();
    },
  });

  const fulfillRequest = trpc.communityRequest.fulfill.useMutation({
    onSuccess: () => {
      utils.communityRequest.list.invalidate();
    },
  });

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une demande..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner-vhs w-6 h-6" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && allItems.length === 0 && (
        <div className="card-vhs p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">
            {search
              ? "Aucune demande ne correspond à votre recherche."
              : "Aucune demande pour le moment."}
          </p>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            Créer la première demande
          </Button>
        </div>
      )}

      {/* List */}
      {!isLoading && allItems.length > 0 && (
        <div className="space-y-3">
          {allItems.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onFulfill={(id) => fulfillRequest.mutate({ id })}
              showFulfillButton={true}
            />
          ))}

          {hasNextPage && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Chargement..." : "Charger plus"}
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (data) => {
          await createRequest.mutateAsync(data);
        }}
      />
    </div>
  );
}
