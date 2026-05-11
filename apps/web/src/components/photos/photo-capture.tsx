/**
 * Composant PhotoCapture — capture photo, upload S3, et intégration DuckDuckGo.
 *
 * Props:
 * - objectId: ID de l'objet parent (requis pour la presigned URL)
 * - onPhotoAdded: callback called with the created Photo record
 * - onError: callback called on upload/API error
 * - maxPhotos: nombre maximum de photos (par défaut: illimité)
 *
 * Utilisation:
 * <PhotoCapture objectId={object.id} onPhotoAdded={(photo) => console.log(photo)} />
 *
 * @package @brol/web
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Upload, Search, X, CheckCircle, Loader2, AlertCircle, Image } from "lucide-react";
import { Button } from "../ui/button";
import { usePresignedUrl, usePhotoAdd } from "../../lib/trpc-hooks/photos";
import { searchImages, type ImageResult, proxyImageUrl } from "../../lib/duckduckgo";
import type { Photo } from "@brol/shared";

interface PhotoCaptureProps {
  objectId: string;
  onPhotoAdded?: (photo: Photo) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

type Source = "camera" | "file" | "search";
type Status = "idle" | "preview" | "uploading" | "success" | "error";

export function PhotoCapture({
  objectId,
  onPhotoAdded,
  onError,
  disabled,
}: PhotoCaptureProps) {
  const [open, setOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<Source>("file");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchImage, setSelectedSearchImage] = useState<ImageResult | null>(null);
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
    setSelectedSearchImage(null);
    setSearchResults([]);
    setSearchQuery("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  // Gère la sélection de fichier (upload ou caméra)
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await processFile(file);
    },
    [objectId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Traite un fichier (preview + upload)
  const processFile = useCallback(
    async (file: File) => {
      // Valider le type
      if (!file.type.startsWith("image/")) {
        setStatus("error");
        setErrorMessage("Le fichier doit être une image (JPEG, PNG, WebP, GIF)");
        return;
      }

      // Valider la taille (10MB max — correspond à S3_MAX_FILE_SIZE_MB)
      if (file.size > 10 * 1024 * 1024) {
        setStatus("error");
        setErrorMessage("Le fichier est trop volumineux. Maximum: 10 Mo.");
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
    },
    [objectId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Upload un fichier vers S3 via presigned URL
  const uploadFile = useCallback(
    async (file: File) => {
      setStatus("uploading");

      try {
        // 1. Demander la presigned URL
        const { uploadUrl, publicUrl } = await presignedMutation.mutateAsync({
          objectId,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        // 2. Upload direct vers S3 (PUT request)
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload échoué: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        // 3. Enregistrer la photo en base
        await addMutation.mutateAsync({
          objectId,
          url: publicUrl,
          position: 0, // TODO: calculer la prochaine position
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'upload";
        setStatus("error");
        setErrorMessage(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [objectId, presignedMutation, addMutation, onError]
  );

  // Upload une image depuis DuckDuckGo (proxée via notre backend)
  const uploadImageFromSearch = useCallback(
    async (image: ImageResult) => {
      setSelectedSearchImage(image);
      setPreviewUrl(proxyImageUrl(image.url));
      setStatus("preview");

      try {
        // Pour les images DuckDuckGo: on les proxie via notre API
        // On fait un fetch de l'image, puis on l'upload via presigned URL
        const imageResponse = await fetch(proxyImageUrl(image.url));
        if (!imageResponse.ok) {
          throw new Error(`Impossible de charger l'image: ${imageResponse.status}`);
        }

        const blob = await imageResponse.blob();
        // Déterminer le type MIME depuis l'URL ou fallback
        const ext = image.url.split(".").pop()?.toLowerCase().split("?")[0];
        const mimeTypes: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          gif: "image/gif",
        };
        const mimeType = mimeTypes[ext ?? ""] ?? "image/jpeg";
        const filename = `search-${Date.now()}.${ext ?? "jpg"}`;

        const file = new File([blob], filename, { type: mimeType });
        await uploadFile(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du téléchargement de l'image";
        setStatus("error");
        setErrorMessage(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [objectId, uploadFile, onError] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Recherche DuckDuckGo Images
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchResults([]);
    try {
      const results = await searchImages(searchQuery.trim(), { limit: 20 });
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

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
        Ajouter une photo
      </Button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-mono text-sm font-medium">Ajouter une photo</h2>
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

            {/* Onglets */}
            {status === "idle" && (
              <div className="flex border-b border-border">
                {[
                  { id: "file", label: "Fichier", icon: Upload },
                  { id: "camera", label: "Caméra", icon: Camera },
                  { id: "search", label: "Rechercher", icon: Search },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSource(tab.id as Source)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 text-sm font-mono
                      border-b-2 transition-colors
                      ${activeSource === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Contenu */}
            <div className="p-4">
              {/* === ONGLET FICHIER === */}
              {activeSource === "file" && status === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">
                    Sélectionnez une image depuis votre appareil.
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
                    Choisir un fichier
                  </Button>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    JPEG, PNG, WebP, GIF • Max 10 Mo
                  </p>
                </div>
              )}

              {/* === ONGLET CAMÉRA === */}
              {activeSource === "camera" && status === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">
                    Prenez une photo avec votre appareil.
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
                    Ouvrir la caméra
                  </Button>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    Caméra arrière sur mobile
                  </p>
                </div>
              )}

              {/* === ONGLET RECHERCHE === */}
              {activeSource === "search" && status === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">
                    Recherchez une image sur le web.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom de l'objet, auteur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-input border-2 border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSearch}
                      disabled={searchLoading || !searchQuery.trim()}
                    >
                      {searchLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Résultats */}
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {searchResults.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => uploadImageFromSearch(img)}
                          className="aspect-square overflow-hidden border-2 border-border hover:border-primary transition-colors"
                          title={img.title}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proxyImageUrl(img.url)}
                            alt={img.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && searchQuery && !searchLoading && (
                    <p className="text-sm text-muted-foreground font-mono text-center py-4">
                      Aucun résultat — essayez un autre terme
                    </p>
                  )}

                  {!searchQuery && (
                    <p className="text-xs text-muted-foreground font-mono text-center">
                      Recherche via DuckDuckGo Images
                    </p>
                  )}
                </div>
              )}

              {/* === PREVIEW === */}
              {status === "preview" && previewUrl && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono">Aperçu</p>
                  <div className="relative aspect-video bg-black overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedSearchImage && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Source: DuckDuckGo Images
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={reset}
                  >
                    Annuler
                  </Button>
                </div>
              )}

              {/* === UPLOAD EN COURS === */}
              {status === "uploading" && (
                <div className="space-y-4 py-8 text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-mono">
                    Envoi en cours...
                  </p>
                </div>
              )}

              {/* === SUCCÈS === */}
              {status === "success" && (
                <div className="space-y-4 py-8 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm font-mono">Photo ajoutée !</p>
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
                    Réessayer
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
