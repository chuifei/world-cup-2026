import { AlertTriangle } from "lucide-react"

export function DataNotice() {
  return (
    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-yellow-200/90 text-xs md:text-sm flex items-start gap-2 mb-6">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>
        本站数据为模拟演示数据。2026世界杯将于2026年6月11日正式开赛，届时将接入实时数据。
      </span>
    </div>
  )
}
