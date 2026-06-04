"use client";

import { UserAvatar } from "./user-avatar";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: Date | string;
    author: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  };
}

function formatDate(dateStr: Date | string): string {
  return new Intl.DateTimeFormat("fr", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex gap-3 p-4 rounded-lg border bg-card">
      <UserAvatar
        name={review.author.name}
        image={review.author.image}
        size="sm"
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium text-sm truncate">
            {review.author.name || "Anonyme"}
          </span>
          <time className="text-xs text-muted-foreground flex-shrink-0">
            {formatDate(review.createdAt)}
          </time>
        </div>
        <StarRating rating={review.rating} size="sm" />
        {review.comment && (
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}
