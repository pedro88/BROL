/**
 * Galerie photo pour la page détail d'un objet.
 * @package @brol/web
 */

"use client";

import { useState } from "react";
import { Loader2, Trash2, ImageOff } from "lucide-react";
import { Button } from "../ui/button";
import { PhotoCapture } from "./photo-capture";
import { usePhotosList, usePhotoRemove } from "../../lib/trpc-hooks/photos";
import type { Photo } from "@brol/shared";

interface PhotoGalleryProps {
  objectId: string;
  coverImage?: string | null; // coverImage from the object itself
}

export function PhotoGallery({ objectId, coverImage }: PhotoGalleryProps) {
  const { data: photos, isLoading, error } = usePhotosList(objectId);
  const removeMutation = usePhotoRemove({
    onError: (err) => {
      console.error("[PhotoGallery] remove error:", err);
    },
  });

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (photo: Photo) => {
    if (confirmDelete === photo.id) {
      removeMutation.mutate({ objectId, photoId: photo.id });
      setConfirmDelete(null);
    } else {
      setConfirmDelete(photo.id);
      // Auto-reset confirmation after 3s
      setTimeout(() => setConfirmDelete((c) => (c === photo.id ? null : c)), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-medium uppercase text-muted-foreground">
          Photos
          {photos && photos.length > 0 && (
            <span className="ml-2 text-xs">({photos.length})</span>
          )}
        </h3>
        <PhotoCapture objectId={objectId} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive font-mono py-4">
          Erreur de chargement des photos.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !error && photos?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border">
          <ImageOff className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground font-mono">
            Pas encore de photos
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Ajoutez une photo depuis votre appareil, votre caméra ou une recherche web.
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && photos && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square bg-muted overflow-hidden border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo ${photo.position + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Delete overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo)}
                  disabled={removeMutation.isPending}
                  className={`
                    p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all
                    ${confirmDelete === photo.id
                      ? "bg-red-500 text-white opacity-100"
                      : "bg-black/60 text-white hover:bg-red-500"
                    }
                  `}
                  title={confirmDelete === photo.id ? "Confirmer la suppression" : "Supprimer"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {confirmDelete === photo.id && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs font-mono text-center py-1">
                  Confirmer ?
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
