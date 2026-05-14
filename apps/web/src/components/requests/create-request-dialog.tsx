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

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description?: string; zone?: string }) => Promise<void>;
}

export function CreateRequestDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateRequestDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [zone, setZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        zone: zone.trim() || undefined,
      });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setZone("");
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
              placeholder="Ex: Jeu de société pour 4 joueurs"
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
              placeholder="Précisez le contexte, vos besoins..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Zone géographique{" "}
              <span className="font-normal text-muted-foreground">
                (optionnel)
              </span>
            </label>
            <Input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="Ex: 1040, Bruxelles, Belgique"
              maxLength={100}
            />
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
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Création..." : "Créer la demande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
