import { useState } from "react"
import { cn } from "@/lib/utils"

interface FlagImageProps {
  code: string
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = { sm: 20, md: 28, lg: 40, xl: 56 }

export function FlagImage({ code, alt, size = "md", className }: FlagImageProps) {
  const [error, setError] = useState(false)
  const px = sizeMap[size]

  if (error) {
    return (
      <div
        className={cn("flex items-center justify-center rounded bg-muted text-lg", className)}
        style={{ width: px, height: px * 0.67 }}
      >
        🏳️
      </div>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 80w, https://flagcdn.com/w160/${code.toLowerCase()}.png 160w`}
      sizes={`${px}px`}
      alt={alt}
      width={px}
      height={px * 0.67}
      className={cn("object-cover rounded-sm shadow-sm", className)}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
