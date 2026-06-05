import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "live" | "success" | "warning" | "info"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    live: "bg-red-600 text-white animate-pulse-live",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white",
    info: "bg-blue-600 text-white",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
