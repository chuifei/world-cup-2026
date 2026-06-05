export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white animate-pulse-live">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      LIVE
    </span>
  )
}
