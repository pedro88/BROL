"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Trash2,
  Plus,
  Loader2,
  Package,
  Printer,
} from "lucide-react";
import { Header, Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { trpc } from "../../lib/trpc";
import { QrCodeImage } from "../../components/qr/qr-code-image";

type QrSize = "20mm" | "30mm" | "40mm" | "60mm";

const QR_SIZE_MM: Record<QrSize, number> = {
  "20mm": 20,
  "30mm": 30,
  "40mm": 40,
  "60mm": 60,
};

/**
 * Page de gestion du stock de QR codes.
 * Liste les codes existants, permet d'en générer et de supprimer.
 */
export default function QrStockPage() {
  const t = useTranslations();
  const [generateCount, setGenerateCount] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printSize, setPrintSize] = useState<QrSize>("30mm");
  const [search, setSearch] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");

  const { data: collectionsData } = trpc.collections.list.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data, isLoading, isFetching } = trpc.qr.listStock.useQuery(
    {
      ...(search && { search }),
      ...(collectionId && { collectionId }),
    },
    { keepPrevious: true }
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectAllAvailable = () => {
    if (!data?.items) return;
    setSelectedIds(new Set(data.items.map((q) => q.id)));
  };

  const selectedCodes = useMemo(() => {
    if (!data?.items) return [] as Array<{ id: string; code: string; objectName: string | null }>;
    return data.items
      .filter((q) => selectedIds.has(q.id))
      .map((q) => ({
        id: q.id,
        code: q.code,
        objectName: q.object?.name ?? null,
      }));
  }, [data?.items, selectedIds]);

  const handlePrint = () => {
    if (selectedCodes.length === 0) return;
    const mm = QR_SIZE_MM[printSize];
    // Génère une page imprimable HTML, ouvre une nouvelle fenêtre,
    // déclenche window.print(). L'utilisateur sauve en PDF via le dialog
    // d'impression du navigateur. Pas de dépendance lourde jsPDF.
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const items = selectedCodes
      .map((c) => {
        const url = `${baseUrl}/qr/${c.code}`;
        const qrImg = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=240x240&margin=0`;
        const label = c.objectName ? `${c.objectName}` : c.code;
        return `<div class="qr-cell"><img src="${qrImg}" alt="${c.code}"/><span>${label}</span></div>`;
      })
      .join("");
    win.document.write(`<!doctype html><html><head><title>Brol QR — impression</title>
      <style>
        @page { margin: 8mm; }
        body { font-family: ui-monospace, Menlo, monospace; margin: 0; padding: 8mm; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(${mm + 4}mm, 1fr)); gap: 4mm; }
        .qr-cell { display: flex; flex-direction: column; align-items: center; gap: 2mm; page-break-inside: avoid; }
        .qr-cell img { width: ${mm}mm; height: ${mm}mm; }
        .qr-cell span { font-size: 8pt; max-width: ${mm + 8}mm; text-align: center; word-break: break-all; }
      </style></head><body>
      <div class="grid">${items}</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),250);};</script>
      </body></html>`);
    win.document.close();
  };

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
    if (confirm(t("qrCodes.confirmDelete"))) {
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
          <h1 className="font-display text-3xl vhs-text-glow text-primary uppercase">
            QR CODES
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            {t("qrCodes.pageDescription")}
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
                {t("qrCodes.countLabel")}
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
              {t("qrCodes.generateButton")}
            </Button>
          </div>
          {generateMutation.isError && (
            <p className="font-mono text-xs text-destructive mt-2">
              {generateMutation.error.message}
            </p>
          )}
          {generateMutation.isSuccess && (
            <p className="font-mono text-xs text-green-400 mt-2">
              {t("qrCodes.generatedSuccess", { count: generateMutation.data.count })}
            </p>
          )}
        </div>

        {/* Sélection + impression */}
        {data && data.items.length > 0 && (
          <div className="card-vhs p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-mono text-xs text-muted-foreground uppercase">
                {t("qrCodes.selectionCount", { count: selectedIds.size })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllAvailable}
                  className="font-mono text-xs"
                >
                  {t("qrCodes.selectAll")}
                </Button>
                {selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="font-mono text-xs"
                  >
                    {t("qrCodes.clearSelection")}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="qrSize"
                  className="font-mono text-xs text-muted-foreground uppercase block mb-2"
                >
                  {t("qrCodes.sizeLabel")}
                </label>
                <select
                  id="qrSize"
                  value={printSize}
                  onChange={(e) => setPrintSize(e.target.value as QrSize)}
                  className="flex h-10 w-full bg-input border-2 border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="20mm">20 mm</option>
                  <option value="30mm">{t("qrCodes.sizeRecommended")}</option>
                  <option value="40mm">40 mm</option>
                  <option value="60mm">60 mm</option>
                </select>
              </div>
              <Button
                onClick={handlePrint}
                disabled={selectedIds.size === 0}
                className="shrink-0"
                aria-label={t("qrCodes.printButton")}
              >
                <Printer className="w-4 h-4 mr-2" />
                {t("qrCodes.printButton")}
              </Button>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              {t("qrCodes.printInstructions")}
            </p>
          </div>
        )}

        {/* Filtres */}
        {data && (
          <div className="card-vhs p-4 mb-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label
                  htmlFor="qrSearch"
                  className="font-mono text-xs text-muted-foreground uppercase block mb-2"
                >
                  {t("qrCodes.filterByName")}
                </label>
                <Input
                  id="qrSearch"
                  type="text"
                  placeholder={t("qrCodes.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="qrCollection"
                  className="font-mono text-xs text-muted-foreground uppercase block mb-2"
                >
                  {t("qrCodes.filterByCollection")}
                </label>
                <select
                  id="qrCollection"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="flex h-10 w-full bg-input border-2 border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">{t("qrCodes.allCollections")}</option>
                  {collectionsData?.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(search || collectionId) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCollectionId("");
                }}
                className="font-mono text-xs text-primary hover:underline"
              >
                {t("qrCodes.clearFilters")}
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        {data && (
          <div className="flex gap-4 mb-4">
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-primary">
                {data.items.length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                {t("qrCodes.codesLabel")}
              </span>
            </div>
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-secondary">
                {data.items.filter((q) => q.used).length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                {t("qrCodes.usedLabel")}
              </span>
            </div>
            <div className="card-vhs px-4 py-2">
              <span className="font-display text-2xl text-green-400">
                {data.items.filter((q) => !q.used).length}
              </span>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                {t("qrCodes.availableLabel")}
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
            <h2 className="font-display text-xl text-muted-foreground mb-2 uppercase">
              {t("qrCodes.emptyTitle")}
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              {t("qrCodes.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data?.items.map((qr) => {
              const isSelected = selectedIds.has(qr.id);
              return (
                <div
                  key={qr.id}
                  className={`card-vhs p-3 flex flex-col items-center gap-2 relative ${
                    qr.used ? "opacity-80" : ""
                  } ${isSelected ? "border-primary" : ""}`}
                >
                  {/* Checkbox de sélection */}
                  <label className="absolute top-2 left-2 flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(qr.id)}
                      aria-label={t("qrCodes.selectAriaLabel", { code: qr.code })}
                      className="w-4 h-4 rounded border-2 border-border bg-input text-primary focus:ring-2 focus:ring-primary"
                    />
                  </label>

                  <QrCodeImage
                    code={qr.code}
                    size={80}
                    baseUrl={process.env.NEXT_PUBLIC_APP_URL}
                    className="shrink-0 mt-3"
                  />

                  {/* Objet associé si utilisé */}
                  {qr.used && qr.object ? (
                    <Link
                      href={`/objects/${qr.object.id}`}
                      className="w-full text-center hover:text-primary transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {qr.object.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qr.object.coverImage}
                            alt=""
                            className="w-5 h-5 object-cover rounded"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                        <p className="font-mono text-xs truncate">
                          {qr.object.name}
                        </p>
                      </div>
                      {qr.object.collection?.name && (
                        <p className="font-mono text-[10px] text-muted-foreground truncate">
                          {qr.object.collection.name}
                        </p>
                      )}
                    </Link>
                  ) : (
                    <p className="font-mono text-[10px] text-primary truncate w-full text-center" title={qr.code}>
                      {qr.code}
                    </p>
                  )}

                  <span
                    className={`font-mono text-xs px-2 py-0.5 inline-block ${
                      qr.used
                        ? "bg-secondary/20 text-secondary"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {qr.used ? t("qrCodes.statusUsed") : t("qrCodes.statusFree")}
                  </span>

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
              );
            })}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
