import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  Shield,
  Swords,
  X,
  Award,
  Flag,
  ArrowUpDown,
} from "lucide-react"
import { cn, formatNumber, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { tournaments, records, countryHistories } from "@/data/history"
import type { Tournament, WorldCupRecord, CountryHistory } from "@/types"

// ---- 动画变体 ----
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

// ==================== Tab1: 历届回顾 ====================

function PastTournaments() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 200
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  const handleSelect = (t: Tournament) => {
    setSelectedTournament((prev) => (prev?.year === t.year ? null : t))
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-6"
    >
      {/* 横向可滑动时间轴 */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => scroll("left")} className="shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto py-4 px-1 scrollbar-hide flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tournaments.map((t, i) => (
              <motion.button
                key={t.year}
                custom={i}
                variants={fadeInUp}
                onClick={() => handleSelect(t)}
                className={cn(
                  "flex flex-col items-center gap-2 shrink-0 w-24 p-3 rounded-xl transition-all duration-300",
                  selectedTournament?.year === t.year
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/50 hover:shadow-md"
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold",
                    selectedTournament?.year === t.year ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {t.year}
                </span>
                <div className="flex items-center gap-1">
                  <FlagImage code={t.championFlagCode} alt={t.champion} size="sm" />
                </div>
                <span className="text-[10px] leading-tight text-center opacity-70">
                  {t.host}
                </span>
              </motion.button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => scroll("right")} className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 选中详情弹窗 */}
      <AnimatePresence mode="wait">
        {selectedTournament && (
          <motion.div
            key={selectedTournament.year}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={scaleIn}
            className="relative"
          >
            <Card className="border-primary/30 shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>{selectedTournament.year}年 {selectedTournament.host}世界杯</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedTournament.teamsCount}支参赛队伍 · {selectedTournament.totalMatches}场比赛
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTournament(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {/* 四强 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <RankCard
                    rank="冠军"
                    country={selectedTournament.champion}
                    flagCode={selectedTournament.championFlagCode}
                    color="text-yellow-500"
                    bgColor="bg-yellow-500/10"
                  />
                  <RankCard
                    rank="亚军"
                    country={selectedTournament.runnerUp}
                    flagCode={selectedTournament.runnerUpFlagCode}
                    color="text-gray-300"
                    bgColor="bg-gray-300/10"
                  />
                  <RankCard
                    rank="季军"
                    country={selectedTournament.thirdPlace}
                    flagCode={selectedTournament.thirdPlaceFlagCode}
                    color="text-amber-600"
                    bgColor="bg-amber-600/10"
                  />
                  <RankCard
                    rank="殿军"
                    country={selectedTournament.fourthPlace}
                    flagCode={selectedTournament.fourthPlaceFlagCode}
                    color="text-slate-400"
                    bgColor="bg-slate-400/10"
                  />
                </div>

                {/* 奖项 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <AwardCard
                    icon={<Star className="h-4 w-4" />}
                    label="最佳球员（金球奖）"
                    value={selectedTournament.bestPlayer}
                  />
                  <AwardCard
                    icon={<Target className="h-4 w-4" />}
                    label="最佳射手（金靴奖）"
                    value={`${selectedTournament.topScorer}（${selectedTournament.topScorerGoals}球）`}
                  />
                  <AwardCard
                    icon={<Shield className="h-4 w-4" />}
                    label="最佳门将（金手套）"
                    value={selectedTournament.bestGoalkeeper}
                  />
                </div>

                {/* 统计 */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  <StatItem label="总进球" value={selectedTournament.totalGoals.toString()} />
                  <StatItem label="总场次" value={selectedTournament.totalMatches.toString()} />
                  <StatItem label="总观众" value={formatNumber(selectedTournament.totalAttendance)} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedTournament && (
        <p className="text-center text-muted-foreground text-sm py-8">
          点击时间轴上的年份查看该届世界杯详情
        </p>
      )}
    </motion.div>
  )
}

function RankCard({
  rank,
  country,
  flagCode,
  color,
  bgColor,
}: {
  rank: string
  country: string
  flagCode: string
  color: string
  bgColor: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 p-3 rounded-lg text-center", bgColor)}>
      <span className={cn("text-xs font-bold", color)}>{rank}</span>
      <FlagImage code={flagCode} alt={country} size="lg" />
      <span className="text-sm font-medium">{country}</span>
    </div>
  )
}

function AwardCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ==================== Tab2: 历史纪录墙 ====================

const categoryConfig: Record<WorldCupRecord["category"], { label: string; variant: "default" | "live" | "success" | "warning" | "info" }> = {
  team: { label: "球队", variant: "info" },
  player: { label: "球员", variant: "warning" },
  match: { label: "比赛", variant: "success" },
  tournament: { label: "赛事", variant: "default" },
}

function RecordsWall() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record, i) => {
          const cfg = categoryConfig[record.category]
          const isExpanded = expandedId === record.id

          return (
            <motion.div key={record.id} custom={i} variants={fadeInUp}>
              <Card
                className={cn(
                  "h-full cursor-pointer hover:shadow-md transition-all duration-300",
                  isExpanded && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
                onMouseEnter={() => setExpandedId(record.id)}
                onMouseLeave={() => setExpandedId(null)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <CardTitle className="text-base mt-2">{record.title}</CardTitle>
                  <CardDescription>{record.description}</CardDescription>
                </CardHeader>

                {/* 悬停/点击展开详细信息 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {record.detail}
                          </p>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ==================== Tab3: 各国战绩排行 ====================

type SortKey = keyof CountryHistory
type SortDir = "asc" | "desc"

function CountryRankings() {
  const [sortKey, setSortKey] = useState<SortKey>("titles")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = useMemo(() => {
    return [...countryHistories].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "desc" ? -cmp : cmp
    })
  }, [sortKey, sortDir])

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return (
      <span className="text-primary ml-0.5">
        {sortDir === "desc" ? "↓" : "↑"}
      </span>
    )
  }

  const sortableCols: { key: SortKey; label: string }[] = [
    { key: "countryName", label: "国家/地区" },
    { key: "appearances", label: "参赛届数" },
    { key: "titles", label: "冠军次数" },
    { key: "totalMatches", label: "总场次" },
    { key: "wins", label: "胜" },
    { key: "draws", label: "平" },
    { key: "losses", label: "负" },
    { key: "goalsFor", label: "进球" },
    { key: "goalsAgainst", label: "失球" },
    { key: "bestResult", label: "最佳成绩" },
  ]

  const isMobile = false // 简化处理，可用 useIsMobile

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-4"
    >
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {sortableCols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap",
                    sortKey === col.key && "text-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.countryName}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-muted/50",
                  c.titles > 0 && "bg-yellow-500/5 hover:bg-yellow-500/10"
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FlagImage code={c.flagCode} alt={c.countryName} size="sm" />
                    <span className="font-medium">{c.countryName}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{c.appearances}</td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-bold",
                      c.titles > 0 ? "text-yellow-500" : "text-muted-foreground"
                    )}
                  >
                    {c.titles > 0 && <Trophy className="h-3.5 w-3.5" />}
                    {c.titles}
                  </span>
                </td>
                <td className="px-3 py-3">{c.totalMatches}</td>
                <td className="px-3 py-3 text-green-600 dark:text-green-400">{c.wins}</td>
                <td className="px-3 py-3">{c.draws}</td>
                <td className="px-3 py-3 text-red-600 dark:text-red-400">{c.losses}</td>
                <td className="px-3 py-3">{c.goalsFor}</td>
                <td className="px-3 py-3">{c.goalsAgainst}</td>
                <td className="px-3 py-3 text-xs">{c.bestResult}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ==================== 主组件 ====================

export default function History() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* 页面标题 */}
      <motion.div variants={fadeInUp} custom={0}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">历史长廊</h1>
        <p className="text-muted-foreground mt-1">回顾世界杯百年辉煌，探索历届赛事、历史纪录与各国战绩</p>
      </motion.div>

      <Tabs defaultTab="past" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="w-full md:w-auto inline-flex">
            <TabsTrigger value="past" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">历届回顾</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-1.5">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">历史纪录墙</span>
            </TabsTrigger>
            <TabsTrigger value="rankings" className="gap-1.5">
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline">各国战绩</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="past">
          <PastTournaments />
        </TabsContent>
        <TabsContent value="records">
          <RecordsWall />
        </TabsContent>
        <TabsContent value="rankings">
          <CountryRankings />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
