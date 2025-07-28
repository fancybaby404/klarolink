"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface RatingProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Rating({ value = 0, onChange, readonly = false, size = "md", className }: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={cn(
            sizeClasses[size],
            "transition-colors",
            !readonly && "cursor-pointer",
            (hoverValue || value) >= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
          )}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  )
}
