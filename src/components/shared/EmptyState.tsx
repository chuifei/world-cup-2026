import { SearchX } from "lucide-react"

interface EmptyStateProps {
  message?: string
  icon?: "search" | "data"
}

export function EmptyState({ message = "暂无数据", icon = "search" }: EmptyStateProps) {
  const Icon = icon === "search" ? SearchX : SearchX
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="h-16 w-16 mb-4 opacity-30" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm mt-1 opacity-70">请尝试调整筛选条件</p>
    </div>
  )
}
