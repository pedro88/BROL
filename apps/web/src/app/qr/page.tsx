"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, Trash2, Plus, Loader2 } from "lucide-react";
import { Header, Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { trpc } from "../../lib/trpc";
import { QrCodeImage } from "../../components/qr/qr-code-image";

/**
 * Page de gestion du stock de QR codes.
 * Liste les codes existants, permet d'en générer et de supprimer.
 */
export default function QrStockPage() {
  const [generateCount, setGenerateCount] = useState(10);

  // Liste des QR codes
  const { data, isLoading, isFetching } = trpc.qr.listStock.useQuery(
    undefined,
    {}
  );

  const utils = trpc.useUtils();

  // Génération de batch
  const generateMutation = trpc.qr.generateStock.useMutation({
    onSuccess: () => {
      utils.qr.listStock.invalidate();
      setGenerateCount(10);
    },
  });

  // Suppression
  const deleteMutation = trpc.qr.deleteStock.useMutation({
    onSuccess: () => {
      utils.qr.listStock.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce QR code ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const isWorking = generateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Collections
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            QR CODES
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Gérez votre stock de QR codes à coller sur vos objets.
          </p>
        </div>

        {/* Formulaire de génération */}
        <div className="card-vhs p-4 mb-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="count"
                className="font-mono text-xs text-muted-foreground uppercase block mb-2"
              >
                Nombre de codes à générer
              </label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(e) =>
                  setGenerateCount(Math.max(1, Math.min(100, Number(e.target.value))))
                }
                disabled={isWorking}
              />
            </div>
            <Button
              onClick={() => generateMutation.mutate({ count: generateCount })}
              disabled={isWorking}
              className="shrink-0"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Générer
            </Button>
          </div>
          {generateMutation.isError && (
            <p className="font-mono text-xs text-destructive mt-2">
              {generateMutation.error.message}
            </p>
          )}
          {generateMutation.isSuccess && (
            <p className="font-mono text-xs text-green-400 mt-2">
              {generateMutation.data.count} code(s) généré(s) !
            </p>
          )}
        </div>

        {/* Stats */}
        {data && (
          <div className="flex gap-4 mb-4">
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-primary">
                {data.items.length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                codes
              </span>
            </div>
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-secondary">
                {data.items.filter((q) => q.used).length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                utilisés
              </span>
            </div>
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-green-400">
                {data.items.filter((q) => !q.used).length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                disponibles
              </span>
            </div>
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="card-vhs p-8 text-center">
            <QrCode className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              AUCUN QR CODE
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              Générez votre premier batch de codes ci-dessus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data?.items.map((qr) => (
              <div
                key={qr.id}
                className={`card-vhs p-3 flex flex-col items-center gap-2 ${
                  qr.used ? "opacity-60" : ""
                }`}
              >
                <QrCodeImage
                  code={qr.code}
                  size={80}
                  baseUrl={process.env.NEXT_PUBLIC_APP_URL}
                  className="shrink-0"
                />
                <div className="w-full text-center">
                  <p className="font-mono text-[10px] text-primary truncate" title={qr.code}>
                    {qr.code}
                  </p>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 mt-1 inline-block ${
                      qr.used
                        ? "bg-secondary/20 text-secondary"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {qr.used ? "Utilisé" : "Libre"}
                  </span>
                </div>
                {!qr.used && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(qr.id)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-destructive self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
