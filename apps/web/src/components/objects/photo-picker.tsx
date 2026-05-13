"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "../ui/button";

type Status = "idle" | "preview";

interface PhotoPickerProps {
  onPhotoSelected: (file: File) => void;
  disabled?: boolean;
}

export function PhotoPicker({ onPhotoSelected, disabled }: PhotoPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<"file" | "camera">("file");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setSelectedFile(file);
        onPhotoSelected(file);
        setOpen(false);
      };
      reader.readAsDataURL(file);
    },
    [onPhotoSelected]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await processFile(file);
    },
    [processFile]
  );

  const removePhoto = useCallback(() => {
    reset();
    onPhotoSelected(null as unknown as File);
  }, [reset, onPhotoSelected]);

  if (previewUrl) {
    return (
      <div className="relative aspect-video bg-black overflow-hidden border border-border max-w-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Aperçu"
          className="w-full h-full object-contain"
        />
        <button
          type="button"
          onClick={removePhoto}
          className="absolute top-2 right-2 p-1 bg-destructive/80 hover:bg-destructive rounded"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Ajouter une photo
      </Button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-mono text-sm font-medium">Ajouter une photo</h2>
              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
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
                Fichier
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
                Caméra
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {activeSource === "file" ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}