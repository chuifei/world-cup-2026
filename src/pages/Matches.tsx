import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Trophy,
  Swords,
  MapPin,
  Clock,
  ChevronRight,
  Medal,
  Info,
  Flag,
} from "lucide-react"
import { cn, formatBeijingTime, formatDate } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataStatusBadge } from "@/components/shared/DataStatusBadge"
import { teams, matches, groupStandings } from "@/data"
import type { Team, Match, GroupStandings } from "@/types"

// ============================================
// 工具函数
// ============================================

function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

/** 按日期分组比赛，并按日期排序 */
function groupMatchesByDate(matchList: Match[]): { date: string; label: string; matches: Match[] }[] {
  const map = new Map<string, Match[]>()
  matchList.forEach((m) => {
    const d = m.date.split("T")[0]
    if (!map.has(d)) map.set(d, [])
    map.get(d)!.push(m)
  })
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ms]) => ({
      date,
      label: formatDate(date),
      matches: ms.sort((a, b) => a.date.localeCompare(b.date)),
    }))
}

/** 按轮次分组比赛 */
function groupMatchesByRound(matchList: Match[]): { round: Match["round"]; label: string; matches: Match[] }[] {
  const order: Match["round"][] = ["小组赛", "32强", "16强", "8强", "4强", "季军赛", "决赛"]
  const labels: Record<Match["round"], string> = {
    小组赛: "小组赛（72场）",
    "32强": "32强淘汰赛（16场）",
    "16强": "16强淘汰赛（8场）",
    "8强": "8强淘汰赛（4场）",
    "4强": "半决赛（2场）",
    季军赛: "季军赛",
    决赛: "决赛",
  }
  const map = new Map<Match["round"], Match[]>()
  matchList.forEach((m) => {
    if (!map.has(m.round)) map.set(m.round, [])
    map.get(m.round)!.push(m)
  })
  return order
    .filter((r) => map.has(r))
    .map((r) => ({ round: r, label: labels[r], matches: map.get(r)! }))
}

// ============================================
// 动画变体
// ============================================

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

// ============================================
// 子组件
// ============================================

/** 日期选择器 */
function DateSelector({
  dates,
  selectedDate,
  onSelect,
}: {
  dates: { date: string; label: string }[]
  selectedDate: string
  onSelect: (date: string) => void
}) {
  return (
    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
      {dates.map((d) => (
        <button
          key={d.date}
          onClick={() => onSelect(d.date)}
          className={cn(
            "shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
            "whitespace-nowrap md:whitespace-normal",
            selectedDate === d.date
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <span className="block text-xs opacity-70">{d.label}</span>
          <span className="block text-base">
            {new Date(d.date).toLocaleDateString("zh-CN", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </button>
      ))}
    </div>
  )
}

/** 积分榜空状态 */
function StandingsEmptyState({ group }: { group: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary font-bold">
            {group}
          </span>
          {group}组 积分榜
          <DataStatusBadge status="pending" className="ml-2" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 w-10">#</th>
                <th className="text-left py-3 px-2">球队</th>
                <th className="text-center py-3 px-2 w-8">场</th>
                <th className="text-center py-3 px-2 w-8">胜</th>
                <th className="text-center py-3 px-2 w-8">平</th>
                <th className="text-center py-3 px-2 w-8">负</th>
                <th className="text-center py-3 px-2 w-8">进</th>
                <th className="text-center py-3 px-2 w-8">失</th>
                <th className="text-center py-3 px-2 w-10">净胜</th>
                <th className="text-center py-3 px-2 w-10 font-bold">积分</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((pos) => (
                <tr key={pos} className="border-b border-border/30">
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-muted-foreground/40">
                      {pos}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-muted-foreground/40 italic">待定</span>
                  </td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                  <td className="text-center py-3 px-2 text-muted-foreground/40 tabular-nums">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            小组赛尚未开始，积分榜待更新。抽签后各队将被分配至具体小组。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** 赛程框架卡片（无比分，仅日期+场馆） */
function MatchFrameworkCard({ match, isFirst }: { match: Match; isFirst?: boolean }) {
  const matchDate = new Date(match.date)
  const daysUntil = Math.max(
    0,
    Math.ceil((matchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )
  const isOpeningMatch = match.id === "m003" // 墨西哥城阿兹特克开幕战

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50",
        isOpeningMatch && "border-amber-500/30 bg-amber-950/10"
      )}
    >
      <div className="shrink-0 flex flex-col items-center w-14 text-center">
        <span className="text-xs font-semibold text-primary">
          {matchDate.toLocaleDateString("zh-CN", { month: "short" })}
        </span>
        <span className="text-lg font-bold tabular-nums">
          {matchDate.getDate()}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {matchDate.toLocaleDateString("zh-CN", { weekday: "short" })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info" className="text-[10px]">{match.round}</Badge>
          {isOpeningMatch && (
            <Badge variant="warning" className="text-[10px]">开幕战</Badge>
          )}
          {isFirst && (
            <span className="text-[10px] text-amber-500 font-medium ml-auto">
              {daysUntil}天后
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 py-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-7 rounded-sm bg-muted/50 flex items-center justify-center">
              <Flag className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <span className="text-[10px] text-muted-foreground">待抽签</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-muted-foreground">
              {formatBeijingTime(match.date)}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">北京时间</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-7 rounded-sm bg-muted/50 flex items-center justify-center">
              <Flag className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <span className="text-[10px] text-muted-foreground">待抽签</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" />
          {match.venue} · {match.city}
        </p>
      </div>
    </div>
  )
}

/** 淘汰赛对阵树 —— 全部待定 */
function KnockoutBracketPlaceholder() {
  const rounds = [
    { name: "32强", count: 16, color: "border-gray-500/30" },
    { name: "16强", count: 8, color: "border-gray-500/30" },
    { name: "8强", count: 4, color: "border-gray-500/30" },
    { name: "半决赛", count: 2, color: "border-gray-500/30" },
    { name: "季军赛", count: 1, color: "border-gray-500/30" },
    { name: "决赛", count: 1, color: "border-amber-500/40" },
  ]

  return (
    <div className="space-y-4">
      {/* 对阵树概览 —— 用轮次卡片代替 */}
      <div className="flex items-start gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide min-w-[600px]">
        {rounds.map((round, idx) => (
          <div key={round.name} className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col gap-2 shrink-0">
              <p className="text-xs text-muted-foreground font-medium text-center">
                {round.name}
              </p>
              <div
                className={cn(
                  "rounded-lg border p-3 min-w-[130px] bg-card",
                  round.color,
                  round.name === "决赛" && "shadow-lg shadow-amber-500/5 bg-amber-950/10"
                )}
              >
                {round.name === "决赛" || round.name === "季军赛" ? (
                  <>
                    <p className="text-[10px] text-muted-foreground text-center mb-2">
                      {round.name === "决赛" ? "2026年7月19日" : "2026年7月18日"}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 rounded-sm bg-muted/50" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                      <div className="border-t border-border/20" />
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 rounded-sm bg-muted/50" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                    </div>
                    {round.name === "决赛" && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Medal className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">冠军</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: Math.min(round.count, 4) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <div className="w-4 h-3 rounded-sm bg-muted/50 shrink-0" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                    ))}
                    {round.count > 4 && (
                      <p className="text-[10px] text-muted-foreground/40 text-center">
                        ... 共{round.count}场
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {idx < rounds.length - 1 && (
              <div className="flex items-center shrink-0">
                <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Matches 页面主组件
// ============================================

export default function Matches() {
  // 按日期分组的比赛
  const dateGroups = useMemo(() => groupMatchesByDate(matches), [])

  // 按轮次分组的比赛（用于赛程框架展示）
  const roundGroups = useMemo(() => groupMatchesByRound(matches), [])

  // 状态
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateGroups.length > 0 ? dateGroups[0].date : ""
  })
  const [activeStandingsGroup, setActiveStandingsGroup] = useState("A")

  // 当前选中日期的比赛
  const selectedDateMatches = useMemo(() => {
    const group = dateGroups.find((dg) => dg.date === selectedDate)
    return group ? group.matches : []
  }, [dateGroups, selectedDate])

  // 当前积分榜数据
  const currentGroupStandings = useMemo(() => {
    return groupStandings.find((gs) => gs.group === activeStandingsGroup)
  }, [activeStandingsGroup])

  return (
    <main className="min-h-screen">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-7 w-7 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">赛事中心</h1>
              <DataStatusBadge status="pending" />
            </div>
            <p className="text-muted-foreground mt-2">
              赛程框架、积分榜与淘汰赛对阵 —— 抽签尚未进行，对阵信息待FIFA公布
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <Tabs defaultTab="schedule" className="w-full">
          {/* Tab 导航栏 */}
          <TabsList className="w-full md:w-auto flex overflow-x-auto scrollbar-hide">
            <TabsTrigger value="schedule" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">赛程框架</span>
              <span className="sm:hidden">赛程</span>
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-1.5">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">积分榜</span>
              <span className="sm:hidden">积分</span>
            </TabsTrigger>
            <TabsTrigger value="bracket" className="gap-1.5">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">淘汰赛对阵</span>
              <span className="sm:hidden">淘汰赛</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== Tab① 赛程框架 ==================== */}
          <TabsContent value="schedule">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* 数据状态提示 */}
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">赛程数据说明</span>
                  <DataStatusBadge status="pending" />
                </div>
                <p className="text-sm text-muted-foreground">
                  2026世界杯抽签尚未进行，具体对阵待FIFA公布。以下为已知的比赛日期框架与场馆信息。所有比赛的对阵双方、开球细节将在抽签后更新。
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
                    <Calendar className="h-3 w-3" /> 开幕：2026年6月11日
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
                    <Trophy className="h-3 w-3" /> 决赛：2026年7月19日
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
                    <MapPin className="h-3 w-3" /> 16座场馆 · 美加墨三国
                  </span>
                </div>
              </div>

              {/* 切换：按日期 / 按轮次 */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="info">
                  共 {matches.length} 场比赛框架
                </Badge>
              </div>

              {/* 按日期浏览 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 shrink-0">
                  <p className="text-xs text-muted-foreground font-medium mb-2 hidden md:block">
                    按日期浏览
                  </p>
                  {dateGroups.length > 0 ? (
                    <DateSelector
                      dates={dateGroups.map((dg) => ({ date: dg.date, label: dg.label }))}
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                    />
                  ) : (
                    <EmptyState message="暂无赛程" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDate}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={fadeIn}
                      className="space-y-3"
                    >
                      {selectedDateMatches.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">
                              {formatDate(selectedDate)}
                            </h3>
                            <Badge variant="default">
                              {selectedDateMatches.length}场比赛
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {selectedDateMatches.map((match, idx) => (
                              <MatchFrameworkCard
                                key={match.id}
                                match={match}
                                isFirst={idx === 0}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <EmptyState message="该日期暂无比赛" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* 按轮次总览 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  赛程框架总览
                </h3>
                <div className="space-y-4">
                  {roundGroups.map((rg) => {
                    // 取该轮次的第一场和最后一场日期
                    const dates = rg.matches.map((m) => new Date(m.date))
                    const firstDate = dates[0]
                    const lastDate = dates[dates.length - 1]
                    const fmtRange = firstDate && lastDate
                      ? `${firstDate.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })} — ${lastDate.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}`
                      : ""
                    return (
                      <div key={rg.round} className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{rg.label}</h4>
                            <Badge variant="info">{rg.matches.length}场</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{fmtRange}</span>
                        </div>
                        <div className="space-y-1.5">
                          {rg.matches.slice(0, 6).map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 text-xs text-muted-foreground py-1 px-2 rounded hover:bg-muted/30 transition-colors"
                            >
                              <span className="w-12 shrink-0 tabular-nums">
                                {new Date(m.date).toLocaleDateString("zh-CN", { month: "short", day: "2-digit" })}
                              </span>
                              <Clock className="h-3 w-3 shrink-0" />
                              <span className="w-14 shrink-0 tabular-nums">
                                {formatBeijingTime(m.date)}
                              </span>
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{m.venue} · {m.city}</span>
                              {m.id === "m003" && (
                                <span className="shrink-0 text-[10px] text-amber-500 font-medium">开幕战</span>
                              )}
                              {m.id === "m104" && (
                                <span className="shrink-0 text-[10px] text-amber-500 font-medium">决赛</span>
                              )}
                            </div>
                          ))}
                          {rg.matches.length > 6 && (
                            <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
                              ... 还有 {rg.matches.length - 6} 场比赛
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ==================== Tab② 积分榜 ==================== */}
          <TabsContent value="standings">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* 数据状态提示 */}
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">积分榜数据说明</span>
                  <DataStatusBadge status="pending" />
                </div>
                <p className="text-sm text-muted-foreground">
                  小组赛尚未开始，所有积分榜均为初始状态。抽签尚未进行，各队小组分配待FIFA公布。比赛开始后将实时更新比赛数据与积分排名。
                </p>
              </div>

              {/* 小组选择器 */}
              <div className="flex gap-1.5 flex-wrap">
                {groupStandings.map((gs) => (
                  <button
                    key={gs.group}
                    onClick={() => setActiveStandingsGroup(gs.group)}
                    className={cn(
                      "w-9 h-9 rounded-md text-sm font-medium transition-all duration-200",
                      activeStandingsGroup === gs.group
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {gs.group}
                  </button>
                ))}
              </div>

              {/* 积分榜空状态 */}
              <StandingsEmptyState group={activeStandingsGroup} />
            </motion.div>
          </TabsContent>

          {/* ==================== Tab③ 淘汰赛对阵树 ==================== */}
          <TabsContent value="bracket">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* 数据状态提示 */}
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">淘汰赛对阵说明</span>
                  <DataStatusBadge status="pending" />
                </div>
                <p className="text-sm text-muted-foreground">
                  所有淘汰赛对阵将在小组赛结束后确定。以下为赛事对阵结构框架展示。
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" />
                    淘汰赛对阵结构
                    <DataStatusBadge status="pending" className="ml-1" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KnockoutBracketPlaceholder />
                </CardContent>
              </Card>

              {/* 赛制说明 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    淘汰赛赛制说明
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">2026世界杯淘汰赛赛制：</p>
                      <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>48支球队分12组（A-L），每组4队。</li>
                        <li>小组前2名（共24队）+ 8个成绩最好的小组第3名，共32支球队晋级淘汰赛。</li>
                        <li>淘汰赛从32强开始，采用单场淘汰制。</li>
                        <li>8个小组第1名（按成绩排序）轮空直接晋级16强。</li>
                        <li>其余16支晋级球队从32强开始角逐。</li>
                        <li>若常规时间打平，进入加时赛（30分钟），再打平则点球决胜。</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">淘汰赛比赛数量：</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">32强：16场</span>
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">16强：8场</span>
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">8强：4场</span>
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">半决赛：2场</span>
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">季军赛：1场</span>
                        <span className="px-2 py-1 rounded bg-muted/50 text-xs">决赛：1场</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      加上小组赛72场，2026世界杯共计104场比赛。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
