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
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  pending: {
    label: "尚未公布",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
  },
  simulated: {
    label: "AI模拟",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
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
