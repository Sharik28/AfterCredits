"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number; // 0 = no rating, 0.5–5.0 in 0.5 steps
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export function StarRatingInput({
  value,
  onChange,
  size = "md",
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number>(0);

  const displayed = hovered > 0 ? hovered : value;

  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const iconSize = sizeMap[size];
  const labelSizeMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const labelSize = labelSizeMap[size];

  // We render 5 stars, each split into two halves via mouse position
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn("flex items-center gap-0.5", disabled && "pointer-events-none opacity-60")}
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Star rating"
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const halfVal = starIndex - 0.5;
          const fullVal = starIndex;

          const isHalfFilled = displayed >= halfVal && displayed < fullVal;
          const isFullFilled = displayed >= fullVal;

          return (
            <div key={starIndex} className="relative flex cursor-pointer">
              {/* Half-star hover zone (left side) */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHovered(halfVal)}
                onClick={() => onChange(halfVal)}
                aria-label={`${halfVal} stars`}
              />
              {/* Full-star hover zone (right side) */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHovered(fullVal)}
                onClick={() => onChange(fullVal)}
                aria-label={`${fullVal} stars`}
              />

              {/* Star Icon Rendering */}
              <div className="relative overflow-hidden">
                <Star
                  className={cn(
                    iconSize,
                    "transition-all duration-100",
                    isFullFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-neutral-600 fill-neutral-800"
                  )}
                />
                {isHalfFilled && (
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={cn(iconSize, "text-amber-400 fill-amber-400")} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating label */}
      <span
        className={cn(
          "font-mono font-bold transition-colors duration-150",
          labelSize,
          displayed > 0 ? "text-amber-300" : "text-neutral-500"
        )}
      >
        {displayed > 0 ? `${displayed.toFixed(1)} / 5.0` : "No rating"}
      </span>
    </div>
  );
}
