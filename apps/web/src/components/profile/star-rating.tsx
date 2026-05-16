"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const starSizes = { sm: 14, md: 18, lg: 24 };

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const px = starSizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = hovered !== null ? value <= hovered : value <= rating;

        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} p-0.5`}
            onMouseEnter={interactive ? () => setHovered(value) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            onClick={interactive && onChange ? () => onChange(value) : undefined}
            aria-label={interactive ? `Noter ${value} étoile${value > 1 ? "s" : ""}` : undefined}
          >
            <svg
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className={filled ? "text-amber-400" : "text-muted-foreground/30"}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
