export interface DataStatusBadgeProps {
  status: "real" | "pending" | "simulated"
  className?: string
}

const statusConfig: Record<
  DataStatusBadgeProps["status"],
  { label: string; bg: string; text: string; border: string }
> = {
  real: {
    label: "已确认",
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-800",
  },
  pending: {
    label: "尚未公布",
    bg: "bg-gray-800/60",
    text: "text-gray-400",
    border: "border-gray-700",
  },
  simulated: {
    label: "AI模拟",
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-800",
  },
}

export function DataStatusBadge({ status, className = "" }: DataStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  )
}
