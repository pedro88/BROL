"use client";

import { useState } from "react";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LeaveReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName?: string;
  onSubmit: (data: { rating: number; comment?: string }) => Promise<void>;
}

export function LeaveReviewDialog({
  open,
  onOpenChange,
  targetName,
  onSubmit,
}: LeaveReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ rating, comment: comment || undefined });
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {targetName && (
            <p className="text-sm text-muted-foreground">
              Votre avis sur <span className="font-medium">{targetName}</span>
            </p>
          )}

          <div>
            <label className="text-sm font-medium block mb-2">Note</label>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onChange={setRating}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Commentaire{" "}
              <span className="font-normal text-muted-foreground">
                (optionnel)
              </span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {comment.length}/1000
            </p>
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
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
