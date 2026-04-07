"use client";

import Link from "next/link";
import { BookOpen, Clock, User } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { ObjectCondition } from "@brol/shared";

const conditionColors: Record<ObjectCondition, string> = {
  NEW: "bg-green-500/20 text-green-400 border-green-500/50",
  LIKE_NEW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  GOOD: "bg-primary/20 text-primary border-primary/50",
  FAIR: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  POOR: "bg-red-500/20 text-red-400 border-red-500/50",
};

const conditionLabels: Record<ObjectCondition, string> = {
  NEW: "Neuf",
  LIKE_NEW: "Comme neuf",
  GOOD: "Bon",
  FAIR: "Correct",
  POOR: "Mauvais",
};

interface ObjectCardProps {
  id: string;
  name: string;
  author?: string | null;
  condition: ObjectCondition;
  coverImage?: string | null;
  currentLoan?: {
    id: string;
    borrower: { id: string; name: string | null };
    returnDueDate?: string | null;
  } | null;
}

/**
 * Carte d'objet avec style VHS retro.
 */
export function ObjectCard({
  id,
  name,
  author,
  condition,
  coverImage,
  currentLoan,
}: ObjectCardProps) {
  const isLoaned = !!currentLoan;

  return (
    <Link href={`/objects/${id}`} className="block">
      <Card className={`group hover:border-primary/50 transition-all ${isLoaned ? "border-secondary/50" : ""}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Cover or placeholder */}
            <div className="w-16 h-20 bg-muted flex-shrink-0 overflow-hidden">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg vhs-text-glow text-primary truncate">
                    {name}
                  </h3>
                  {author && (
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {author}
                    </p>
                  )}
                </div>

                {/* Condition badge */}
                <span
                  className={`px-2 py-0.5 text-xs font-mono border ${conditionColors[condition]} flex-shrink-0`}
                >
                  {conditionLabels[condition]}
                </span>
              </div>

              {/* Loan status */}
              {currentLoan && (
                <div className="mt-2 flex items-center gap-2 text-secondary">
                  <User className="w-3 h-3" />
                  <span className="font-mono text-xs">
                    Prêté à {currentLoan.borrower.name}
                  </span>
                </div>
              )}

              {!currentLoan && (
                <div className="mt-2 flex items-center gap-2 text-muted-foreground/50">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-xs">Disponible</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
