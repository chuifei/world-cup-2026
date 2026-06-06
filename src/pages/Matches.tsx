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
  Star,
} from "lucide-react"
import { cn, formatBeijingTime, formatDate } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
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

/** 比赛卡片 —— 真实球队信息，无比分 */
function GroupMatchCard({ match }: { match: Match }) {
  const matchDate = new Date(match.date)
  const homeTeam = getTeamById(match.homeTeamId)
  const awayTeam = getTeamById(match.awayTeamId)
  const isOpeningMatch = match.id === "m003"

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
        isOpeningMatch
          ? "border-amber-500/30 bg-amber-950/10"
          : "border-border/50 bg-card/50 hover:border-primary/20"
      )}
    >
      {/* 日期列 */}
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

      {/* 比赛信息 */}
      <div className="flex-1 min-w-0">
        {/* 标签行 */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="info" className="text-[10px]">{match.group}组</Badge>
          <DataStatusBadge status="pending" className="text-[10px]" />
          {isOpeningMatch && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-medium ml-auto">
              <Star className="h-3 w-3" />
              开幕战
            </span>
          )}
        </div>

        {/* 双方国旗 + 时间 */}
        <div className="flex items-center justify-center gap-3 py-2">
          {/* 主队 */}
          <div className="flex flex-col items-center gap-1 w-16">
            {homeTeam ? (
              <>
                <FlagImage code={homeTeam.flagCode} alt={homeTeam.name} size="md" />
                <span className="text-[11px] font-medium text-center leading-tight">
                  {homeTeam.name}
                </span>
              </>
            ) : (
              <>
                <div className="w-7 h-5 rounded-sm bg-muted/50 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40">?</span>
                </div>
                <span className="text-[10px] text-muted-foreground">待定</span>
              </>
            )}
          </div>

          {/* 北京时间 */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 mx-1">
            <span className="text-sm font-bold text-foreground tabular-nums">
              {formatBeijingTime(match.date)}
            </span>
            <span className="text-[10px] text-muted-foreground">北京时间</span>
          </div>

          {/* 客队 */}
          <div className="flex flex-col items-center gap-1 w-16">
            {awayTeam ? (
              <>
                <FlagImage code={awayTeam.flagCode} alt={awayTeam.name} size="md" />
                <span className="text-[11px] font-medium text-center leading-tight">
                  {awayTeam.name}
                </span>
              </>
            ) : (
              <>
                <div className="w-7 h-5 rounded-sm bg-muted/50 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40">?</span>
                </div>
                <span className="text-[10px] text-muted-foreground">待定</span>
              </>
            )}
          </div>
        </div>

        {/* 底部场馆 */}
        <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          {match.venue} · {match.city}
        </p>
      </div>
    </div>
  )
}

/** 积分榜面板 —— 显示真实球队，全部积分0 */
function GroupStandingsPanel({ group }: { group: string }) {
  const standingsData = useMemo(() => {
    return groupStandings.find((gs) => gs.group === group)
  }, [group])

  if (!standingsData) {
    return <EmptyState message={`${group}组暂无积分数据`} />
  }

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
                <th className="text-center py-3 px-2 w-10">场</th>
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
              {standingsData.standings.map((standing) => {
                const team = getTeamById(standing.teamId)
                return (
                  <tr key={standing.teamId} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-muted-foreground">
                        {standing.rank}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {team ? (
                          <>
                            <FlagImage code={team.flagCode} alt={team.name} size="sm" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium">{team.name}</span>
                              <span className="text-[10px] text-muted-foreground ml-1">
                                FIFA {team.fifaRank}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-3.5 rounded-sm bg-muted/50 flex items-center justify-center">
                              <span className="text-[9px] text-muted-foreground/40">?</span>
                            </div>
                            <span className="text-sm text-muted-foreground/50 italic">附加赛晋级</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.played}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.won}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.drawn}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.lost}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.goalsFor}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.goalsAgainst}</td>
                    <td className="text-center py-3 px-2 tabular-nums">{standing.goalDifference}</td>
                    <td className="text-center py-3 px-2 font-bold tabular-nums">{standing.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            小组赛尚未开始，全部球队积分均为0。比赛将于2026年6月11日正式开赛，届时积分榜将实时更新。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** 淘汰赛对阵框架 —— 全部待定 */
function KnockoutBracketPlaceholder() {
  const rounds = [
    { name: "32强", count: 16, date: "7月1日 - 7月4日" },
    { name: "16强", count: 8, date: "7月6日 - 7月9日" },
    { name: "8强", count: 4, date: "7月11日 - 7月12日" },
    { name: "半决赛", count: 2, date: "7月14日 - 7月15日" },
    { name: "季军赛", count: 1, date: "7月18日", venue: "硬石体育场 · 迈阿密" },
    { name: "决赛", count: 1, date: "7月19日", venue: "大都会人寿体育场 · 东卢瑟福" },
  ]

  return (
    <div className="space-y-4">
      {/* 对阵树概览 */}
      <div className="flex items-start gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide min-w-[600px]">
        {rounds.map((round, idx) => (
          <div key={round.name} className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col gap-2 shrink-0">
              <p className="text-xs text-muted-foreground font-medium text-center whitespace-nowrap">
                {round.name}
              </p>
              <div
                className={cn(
                  "rounded-lg border p-3 min-w-[130px] bg-card",
                  round.name === "决赛"
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5 bg-amber-950/10"
                    : "border-gray-500/30"
                )}
              >
                <p className="text-[10px] text-muted-foreground/60 text-center mb-2">
                  {round.date}
                </p>

                {/* 对阵占位 */}
                {round.name === "决赛" || round.name === "季军赛" ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="w-5 h-3.5 rounded-sm bg-muted/40 shrink-0" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                      <div className="border-t border-border/20" />
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="w-5 h-3.5 rounded-sm bg-muted/40 shrink-0" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                    </div>
                    {round.venue && (
                      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                        {round.venue}
                      </p>
                    )}
                    {round.name === "决赛" && (
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Medal className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">冠军</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-1.5">
                    {Array.from({ length: Math.min(round.count, 4) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <div className="w-5 h-3.5 rounded-sm bg-muted/40 shrink-0" />
                        <span className="text-xs text-muted-foreground/50 italic">待定</span>
                      </div>
                    ))}
                    {round.count > 4 && (
                      <p className="text-[10px] text-muted-foreground/40 text-center">
                        ... 共{round.count}场比赛
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
  // 仅取小组赛（72场）
  const groupMatches = useMemo(() => {
    return matches.filter((m) => m.round === "小组赛")
  }, [])

  // 按日期分组
  const dateGroups = useMemo(() => groupMatchesByDate(groupMatches), [groupMatches])

  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateGroups.length > 0 ? dateGroups[0].date : ""
  })

  // 当前积分榜小组
  const [activeStandingsGroup, setActiveStandingsGroup] = useState("A")

  // 当前选中日期的比赛
  const selectedDateMatches = useMemo(() => {
    const group = dateGroups.find((dg) => dg.date === selectedDate)
    return group ? group.matches : []
  }, [dateGroups, selectedDate])

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
              小组赛赛程、积分榜与淘汰赛对阵 —— 抽签已于2025年12月完成，全部对阵已公布
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
              <span className="hidden sm:inline">小组赛赛程</span>
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

          {/* ==================== Tab① 小组赛赛程 ==================== */}
          <TabsContent value="schedule">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* 数据概览 */}
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">赛程数据说明</span>
                  <DataStatusBadge status="pending" />
                </div>
                <p className="text-sm text-muted-foreground">
                  2026世界杯抽签已于2025年12月5日完成。48支球队分入12个小组（A-L），72场小组赛对阵已全部确定。
                  所有比赛尚未开赛，比分为空。比赛开始后将实时更新。
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

              {/* 比赛数量 */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="info">共 {groupMatches.length} 场小组赛</Badge>
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
                            {selectedDateMatches.map((match) => (
                              <GroupMatchCard key={match.id} match={match} />
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

              {/* 赛程总览 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  小组赛赛程总览
                </h3>
                <div className="space-y-3">
                  {dateGroups.map((dg) => {
                    const firstMatch = dg.matches[0]
                    const lastMatch = dg.matches[dg.matches.length - 1]
                    const timeRange =
                      firstMatch && lastMatch
                        ? `${formatBeijingTime(firstMatch.date)} - ${formatBeijingTime(lastMatch.date)}`
                        : ""
                    return (
                      <div
                        key={dg.date}
                        className="rounded-lg border border-border bg-card/50 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{dg.label}</h4>
                            <Badge variant="info">{dg.matches.length}场</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{timeRange}</span>
                        </div>
                        <div className="space-y-1">
                          {dg.matches.map((m) => {
                            const homeTeam = getTeamById(m.homeTeamId)
                            const awayTeam = getTeamById(m.awayTeamId)
                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 rounded transition-colors",
                                  m.id === "m003"
                                    ? "bg-amber-950/10 text-amber-600"
                                    : "hover:bg-muted/30"
                                )}
                              >
                                <span className="w-12 shrink-0 tabular-nums">
                                  {formatBeijingTime(m.date)}
                                </span>
                                <span className="w-16 shrink-0 text-right truncate font-medium">
                                  {homeTeam?.name ?? "待定"}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50">vs</span>
                                <span className="w-16 shrink-0 text-left truncate font-medium">
                                  {awayTeam?.name ?? "待定"}
                                </span>
                                <Badge variant="default" className="text-[9px] ml-auto shrink-0">
                                  {m.group}组
                                </Badge>
                                {m.id === "m003" && (
                                  <span className="shrink-0 text-[9px] text-amber-500 font-medium">
                                    开幕战
                                  </span>
                                )}
                              </div>
                            )
                          })}
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
                  小组赛尚未开始，所有球队积分均为0。抽签已于2025年12月完成，12个小组对阵已公布。
                  比赛开始后将实时更新积分榜数据。
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

              {/* 积分榜面板 */}
              <GroupStandingsPanel group={activeStandingsGroup} />
            </motion.div>
          </TabsContent>

          {/* ==================== Tab③ 淘汰赛对阵 ==================== */}
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
                  所有淘汰赛对阵将在小组赛结束后确定。以下为赛事对阵结构框架展示，全部球队待定。
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
