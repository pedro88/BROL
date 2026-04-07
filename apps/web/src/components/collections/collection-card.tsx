"use client";

import Link from "next/link";
import { BookOpen, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface CollectionCardProps {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  objectCount: number;
  onDelete?: (id: string) => void;
}

/**
 * Carte de collection avec style VHS retro.
 */
export function CollectionCard({
  id,
  name,
  description,
  coverImage,
  objectCount,
  onDelete,
}: CollectionCardProps) {
  return (
    <div className="card-vhs group relative overflow-hidden">
      {/* Cover image or placeholder */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <BookOpen className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        
        {/* Object count badge */}
        <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 font-mono text-xs">
          {objectCount} {objectCount === 1 ? "objet" : "objets"}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl vhs-text-glow text-primary truncate">
              {name}
            </h3>
            {description && (
              <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/collections/${id}`}>Voir</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/collections/${id}/edit`}>Modifier</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(id)}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Click overlay */}
      <Link
        href={`/collections/${id}`}
        className="absolute inset-0 z-10"
        aria-label={`Voir la collection ${name}`}
      />
    </div>
  );
}
