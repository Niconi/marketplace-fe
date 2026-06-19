"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={
              interactive
                ? "cursor-pointer transition-transform hover:scale-110 disabled:cursor-default"
                : "cursor-default"
            }
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-muted-foreground/40"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
