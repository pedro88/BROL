"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { QrCode, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { trpc } from "@/lib/trpc";

interface AssignQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectId: string;
  objectName: string;
  onAssigned?: () => void;
}

/**
 * Dialog pour assigner un QR code de stock à un objet.
 */
export function AssignQrDialog({
  open,
  onOpenChange,
  objectId,
  objectName,
  onAssigned,
}: AssignQrDialogProps) {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  // Liste des QR disponibles
  const { data, isLoading } = trpc.qr.listStock.useQuery(
    { used: false },
    { enabled: open }
  );

  // Assignation
  const assignMutation = trpc.qr.assignToObject.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      utils.qr.listStock.invalidate();
      onAssigned?.();
      onOpenChange(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleAssign = (qrStockId: string) => {
    setError(null);
    assignMutation.mutate({ objectId, qrStockId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("qrCodes.assignDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("qrCodes.assignDialogDescription", { objectName })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="py-6 text-center">
            <QrCode className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-mono text-sm text-muted-foreground">
              {t("qrCodes.noAvailableCodes")}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {t("qrCodes.generateFromQrPage")}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data?.items.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleAssign(qr.id)}
                disabled={assignMutation.isPending}
                className="w-full card-vhs p-3 text-left hover:border-primary/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
              >
                <div>
                  <p className="font-mono text-xs text-primary">{qr.code}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {t("qrCodes.createdOn", {
                      date: new Date(qr.createdAt).toLocaleDateString("fr-BE"),
                    })}
                  </p>
                </div>
                <span className="font-mono text-xs text-green-400">
                  {t("qrCodes.freeLabel")}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="font-mono text-xs text-destructive mt-2">{error}</p>
        )}

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

