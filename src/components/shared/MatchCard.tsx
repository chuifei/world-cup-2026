import { motion } from "framer-motion"
import { Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { FlagImage } from "./FlagImage"
import { LiveBadge } from "./LiveBadge"
import { Badge } from "@/components/ui/Badge"
import { formatBeijingTime } from "@/lib/utils"
import type { Match, Team } from "@/types"

interface MatchCardProps {
  match: Match
  homeTeam?: Team
  awayTeam?: Team
  showDetail?: boolean
}

export function MatchCard({ match, homeTeam, awayTeam, showDetail = false }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusBadge = match.status === "live"
    ? <LiveBadge />
    : match.status === "finished"
    ? <Badge variant="default">已结束</Badge>
    : <Badge variant="info">待开赛</Badge>

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card hover:border-primary/20 transition-all duration-300"
    >
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatBeijingTime(match.date)}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{match.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{match.group}组</span>
            {statusBadge}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 justify-end">
            <span className="text-sm md:text-base font-medium truncate">{homeTeam?.name || "主队"}</span>
            <FlagImage code={homeTeam?.flagCode || "xx"} alt={homeTeam?.name || ""} size="lg" />
          </div>
          <div className="mx-3 md:mx-6 text-center shrink-0">
            {match.status === "pending" ? (
              <span className="text-lg md:text-xl font-bold text-muted-foreground">VS</span>
            ) : (
              <span className="text-xl md:text-2xl font-bold tabular-nums">
                {match.homeScore} - {match.awayScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <FlagImage code={awayTeam?.flagCode || "xx"} alt={awayTeam?.name || ""} size="lg" />
            <span className="text-sm md:text-base font-medium truncate">{awayTeam?.name || "客队"}</span>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-2">{match.venue}</p>

        {showDetail && match.status === "finished" && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "收起详情" : "比赛详情"}
            </button>

            {expanded && match.stats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-3 pt-3 border-t border-border space-y-3"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">数据统计</p>
                  <StatBar label="控球率" home={match.stats.possession[0]} away={match.stats.possession[1]} suffix="%" />
                  <StatBar label="射门" home={match.stats.shots[0]} away={match.stats.shots[1]} />
                  <StatBar label="射正" home={match.stats.shotsOnTarget[0]} away={match.stats.shotsOnTarget[1]} />
                  <StatBar label="角球" home={match.stats.corners[0]} away={match.stats.corners[1]} />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

function StatBar({ label, home, away, suffix = "" }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1
  const homePct = (home / total) * 100
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-right tabular-nums">{home}{suffix}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
        <div className="h-full bg-primary/70 rounded-l-full" style={{ width: `${homePct}%` }} />
        <div className="h-full bg-muted-foreground/30 rounded-r-full" style={{ width: `${100 - homePct}%` }} />
      </div>
      <span className="w-8 tabular-nums">{away}{suffix}</span>
    </div>
  )
}
