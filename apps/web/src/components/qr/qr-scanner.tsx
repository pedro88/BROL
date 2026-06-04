"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { trpc } from "../../lib/trpc";

type Status = "idle" | "scanning" | "found" | "error";

interface QrScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function QrScanner({ onCodeScanned, onClose, disabled }: QrScannerProps) {
  const t = useTranslations();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cameraError, setCameraError] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          // SCANNING
          await scannerRef.current.stop();
        }
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setStatus("scanning");
    setCameraError("");

    try {
      const scanner = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Prefer back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          // Code found!
          if (!isMounted.current) return;
          setStatus("found");

          try {
            await scanner.stop();
          } catch {
            // Ignore stop errors
          }

          if (isMounted.current) {
            onCodeScanned(decodedText);
          }
        },
        () => {
          // QR code not in view - ignore
        }
      );
    } catch (err) {
      if (!isMounted.current) return;

      const message = err instanceof Error ? err.message : t("qrCodes.cameraError");
      setCameraError(message);
      setStatus("error");

      // Try front camera as fallback
      if (message.includes("NotFoundError") || message.includes("no cameras")) {
        try {
          const scanner = new Html5Qrcode("qr-reader", {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });

          scannerRef.current = scanner;
          setStatus("scanning");
          setCameraError("");

          await scanner.start(
            { facingMode: "user" }, // Front camera fallback
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            async (decodedText) => {
              if (!isMounted.current) return;
              setStatus("found");

              try {
                await scanner.stop();
              } catch {
                // Ignore
              }

              if (isMounted.current) {
                onCodeScanned(decodedText);
              }
            },
            () => {}
          );
        } catch {
          // Give up
        }
      }
    }
  }, [onCodeScanned]);

  const handleStart = useCallback(() => {
    startScanner();
  }, [startScanner]);

  const handleStop = useCallback(async () => {
    await stopScanner();
    if (isMounted.current) {
      setStatus("idle");
    }
  }, [stopScanner]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setCameraError("");
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h2 className="font-mono text-sm font-medium text-white">{t("qrCodes.scannerTitle")}</h2>
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="p-2 hover:bg-white/10 rounded text-white"
          disabled={status === "scanning"}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Camera view */}
        <div
          id="qr-reader"
          className="w-full max-w-sm overflow-hidden rounded-lg"
          style={{ borderRadius: "12px" }}
        />

        {/* Status UI */}
        <div className="mt-4 text-center">
          {status === "idle" && (
            <>
              <p className="font-mono text-xs text-white/70 mb-4">
                {t("qrCodes.scannerPositionHint")}
              </p>
              <Button
                onClick={handleStart}
                disabled={disabled}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                {t("qrCodes.openCameraButton")}
              </Button>
            </>
          )}

          {status === "scanning" && (
            <>
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-mono text-sm">{t("qrCodes.scanning")}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleStop}
                className="text-white/70"
              >
                {t("common.cancel")}
              </Button>
            </>
          )}

          {status === "found" && (
            <div className="flex flex-col items-center gap-2 text-green-400">
              <CheckCircle className="w-8 h-8" />
              <p className="font-mono text-sm">{t("qrCodes.detectedSuccess")}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p className="font-mono text-sm">{cameraError || errorMessage}</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleRetry}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                {t("qrCodes.retryButton")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-border/50">
        <p className="font-mono text-xs text-white/50 text-center">
          {t("qrCodes.scannerDistanceHint")}
        </p>
      </div>
    </div>
  );
}

/**
 * Hook pour assigner un QR code existant à un objet via scan.
 */
export function useQrAssign(objectId: string) {
  const utils = trpc.useUtils();

  const assignMutation = trpc.qr.assign.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      utils.objects.list.invalidate();
    },
  });

  const assignExisting = useCallback(
    async (qrCode: string) => {
      // qrCode peut être l'URL complète (https://.../qr/{code}) ou juste le code
      // Extraire le code si c'est une URL
      const code = qrCode.includes("/qr/") ? qrCode.split("/qr/").pop()! : qrCode;

      await assignMutation.mutateAsync({
        objectId,
        qrCode: code,
      });

      return code;
    },
    [objectId, assignMutation]
  );

  return { assignExisting, isAssigning: assignMutation.isPending };
}