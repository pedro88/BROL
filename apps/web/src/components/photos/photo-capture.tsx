/**
 * Composant PhotoCapture — capture photo et upload S3.
 *
 * Props:
 * - objectId: ID de l'objet parent (requis pour la presigned URL)
 * - onPhotoAdded: callback called with the created Photo record
 * - onError: callback called on upload/API error
 *
 * Utilisation:
 * <PhotoCapture objectId={object.id} onPhotoAdded={(photo) => console.log(photo)} />
 *
 * @package @brol/web
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Upload, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { usePresignedUrl, usePhotoAdd } from "../../lib/trpc-hooks/photos";
import { compressImage } from "../../lib/image-compress";
import type { Photo } from "@brol/shared";

interface PhotoCaptureProps {
  objectId: string;
  onPhotoAdded?: (photo: Photo) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

type Status = "idle" | "preview" | "uploading" | "success" | "error";

export function PhotoCapture({
  objectId,
  onPhotoAdded,
  onError,
  disabled,
}: PhotoCaptureProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<"camera" | "file">("file");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const presignedMutation = usePresignedUrl();
  const addMutation = usePhotoAdd({
    onSuccess: (photo) => {
      setStatus("success");
      onPhotoAdded?.(photo);
      setTimeout(() => {
        reset();
        setOpen(false);
      }, 1500);
    },
    onError: (err) => {
      setStatus("error");
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      onError?.(err instanceof Error ? err : new Error(message));
    },
  });

  const reset = useCallback(() => {
    setStatus("idle");
    setPreviewUrl(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  const processFile = useCallback(async (file: File) => {
    // Valider le type
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage(t("photos.invalidFileType"));
      return;
    }

    // Valider la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage(t("photos.fileTooLarge"));
      return;
    }

    // Créer la preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreviewUrl(e.target?.result as string);
      setStatus("preview");
      await uploadFile(file);
    };
    reader.readAsDataURL(file);
  }, [objectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await processFile(file);
    },
    [processFile]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setStatus("uploading");

      try {
        // 0. Compresser AVANT signature (la presigned URL est liée à la
        // taille/MIME — signer avec l'original puis envoyer le compressé
        // ferait diverger Content-Length).
        const compressed = await compressImage(file);

        // 1. Demander la presigned URL
        const { uploadUrl, publicUrl } = await presignedMutation.mutateAsync({
          objectId,
          filename: compressed.name,
          contentType: compressed.type,
          fileSize: compressed.size,
        });

        // 2. Upload direct vers S3 (PUT request)
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: compressed,
          headers: {
            "Content-Type": compressed.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(t("photos.uploadFailed", { status: uploadResponse.status, statusText: uploadResponse.statusText }));
        }

        // 3. Enregistrer la photo en base
        await addMutation.mutateAsync({
          objectId,
          url: publicUrl,
          position: 0,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : t("photos.uploadError");
        setStatus("error");
        setErrorMessage(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [objectId, presignedMutation, addMutation, onError, t]
  );

  const isWorking = status === "uploading" || status === "preview";
  const isDisabled = disabled || presignedMutation.isPending || addMutation.isPending;

  return (
    <>
      {/* Bouton déclencheur */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        {t("photos.addPhotoButton")}
      </Button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-mono text-sm font-medium">{t("photos.dialogTitle")}</h2>
              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="p-1 hover:bg-muted rounded"
                disabled={isWorking}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Onglets — Fichier / Caméra */}
            {status === "idle" && (
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveSource("file")}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 text-sm font-mono
                    border-b-2 transition-colors
                    ${activeSource === "file"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Upload className="w-4 h-4" />
                  {t("photos.fileTab")}
                </button>
                <button
                  onClick={() => setActiveSource("camera")}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 text-sm font-mono
                    border-b-2 transition-colors
                    ${activeSource === "camera"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Camera className="w-4 h-4" />
                  {t("photos.cameraTab")}
                </button>
              </div>
            )}

            {/* Contenu */}
            <div className="p-4 space-y-4">
              {/* === ONGLET FICHIER === */}
              {activeSource === "file" && status === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">
                    {t("photos.selectImageHint")}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    {t("photos.chooseFileButton")}
                  </Button>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    {t("photos.fileSupportedFormats")}
                  </p>
                </div>
              )}

              {/* === ONGLET CAMÉRA === */}
              {activeSource === "camera" && status === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">
                    {t("photos.takePictureHint")}
                  </p>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    {t("photos.openCameraButton")}
                  </Button>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    {t("photos.rearCameraHint")}
                  </p>
                </div>
              )}

              {/* === PREVIEW === */}
              {status === "preview" && previewUrl && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">{t("photos.previewLabel")}</p>
                  <div className="relative aspect-video bg-black overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={reset}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              )}

              {/* === UPLOAD EN COURS === */}
              {status === "uploading" && (
                <div className="space-y-4 py-8 text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-mono">
                    {t("photos.uploading")}
                  </p>
                </div>
              )}

              {/* === SUCCÈS === */}
              {status === "success" && (
                <div className="space-y-4 py-8 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm font-mono">{t("photos.photoAddedSuccess")}</p>
                </div>
              )}

              {/* === ERREUR === */}
              {status === "error" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/30 text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm font-mono">{errorMessage}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={reset}
                  >
                    {t("photos.retryButton")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
