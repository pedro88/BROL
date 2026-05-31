"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
type RadiusKm = (typeof RADIUS_OPTIONS)[number];

export type CreateRequestPayload = {
  title: string;
  description?: string;
  radiusKm: RadiusKm;
};

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRequestPayload) => Promise<void>;
  /** Ville de l'utilisateur (affichée dans le hint). Optionnel. */
  city?: string | null;
}

export function CreateRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  city,
}: CreateRequestDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("Le titre doit faire au moins 3 caractères.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        radiusKm,
      });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setRadiusKm(25);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faire une demande à la communauté</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Ce que je cherche <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ex : "scie à onglet" ou "À la recherche du temps perdu"'
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optionnel)
              </span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez le contexte, la durée du prêt souhaitée..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Rayon de recherche : <span className="font-semibold">{radiusKm} km</span>
            </label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRadiusKm(value)}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    radiusKm === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            {city && (
              <p className="mt-2 text-xs text-muted-foreground">
                Autour de <span className="font-medium">{city}</span>.
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || title.trim().length < 3}>
              {loading ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
