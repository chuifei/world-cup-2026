import { useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Footprints,
  Trophy,
  Activity,
  TrendingUp,
  Clock,
  Building2,
  Flag,
  Users,
  BarChart3,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { FlagImage } from "@/components/shared/FlagImage"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { teams, matches } from "@/data"
import { POSITIONS, CONFEDERATIONS } from "@/constants"
import type { Team, Player, Match, ClubHistory } from "@/types"

// ============================================
// 工具函数
// ============================================

interface PlayerWithTeam {
  player: Player
  team: Team
}

function findPlayerById(id: string): PlayerWithTeam | undefined {
  for (const team of teams) {
    const player = team.players.find((p) => p.id === id)
    if (player) return { player, team }
  }
  return undefined
}

/** 获取所有球员（用于计算同位置平均） */
function getAllPlayersWithTeam(): PlayerWithTeam[] {
  const result: PlayerWithTeam[] = []
  for (const team of teams) {
    for (const player of team.players) {
      result.push({ player, team })
    }
  }
  return result
}

/** 位置分组 */
function positionGroup(pos: string): string {
  if (pos === "GK") return "GK"
  if (["CB", "LB", "RB"].includes(pos)) return "DEF"
  if (["CDM", "CM", "CAM", "LM", "RM"].includes(pos)) return "MID"
  return "FWD"
}

// ============================================
// 雷达图维度
// ============================================

const RADAR_DIMENSIONS = [
  { key: "shooting" as const, label: "射门" },
  { key: "passing" as const, label: "传球" },
  { key: "dribbling" as const, label: "盘带" },
  { key: "speed" as const, label: "速度" },
  { key: "defense" as const, label: "防守" },
  { key: "physical" as const, label: "体能" },
]

// ============================================
// 子组件
// ============================================

/** Tab: 本届表现 */
function PerformanceTab({ player, team }: { player: Player; team: Team }) {
  const stats = player.tournamentStats

  // 获取涉及该球员的比赛（同球队的比赛即为该球员可能出场的比赛）
  const teamMatches = useMemo(() => {
    return matches
      .filter(
        (m) =>
          (m.homeTeamId === team.id || m.awayTeamId === team.id) &&
          m.status === "finished"
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [team.id])

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="出场" value={stats.appearances} icon="👕" suffix="次" />
        <StatCard label="进球" value={stats.goals} icon="⚽" suffix="球" />
        <StatCard label="助攻" value={stats.assists} icon="🎯" suffix="次" />
        <StatCard label="黄牌" value={stats.yellowCards} icon="🟨" suffix="张" />
        <StatCard label="红牌" value={stats.redCards} icon="🟥" suffix="张" />
        <StatCard label="场均评分" value={stats.averageRating} icon="⭐" suffix="分" />
      </div>

      {/* 场次明细 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            场次明细
          </CardTitle>
          <CardDescription>
            本届赛事{team.name}已完成的比赛
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMatches.length === 0 ? (
            <EmptyState message="暂无比赛数据" />
          ) : (
            <div className="divide-y divide-border">
              {teamMatches.map((m) => {
                const oppId = m.homeTeamId === team.id ? m.awayTeamId : m.homeTeamId
                const opp = teams.find((t) => t.id === oppId)
                const isHome = m.homeTeamId === team.id
                const teamScore = isHome ? m.homeScore : m.awayScore
                const oppScore = isHome ? m.awayScore : m.homeScore

                // 检查该球员是否在比赛事件中
                const hadEvent = m.events?.some((e) => e.player === player.name)

                return (
                  <div key={m.id} className="flex items-center justify-between py-3 px-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {opp && <FlagImage code={opp.flagCode} alt={opp.name} size="sm" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isHome ? "vs" : "@"} {opp?.name || oppId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(m.date)} · {m.venue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold tabular-nums">
                        {teamScore !== null ? teamScore : "-"} : {oppScore !== null ? oppScore : "-"}
                      </span>
                      {hadEvent && (
                        <Badge variant="success" className="text-[10px]">参与进球</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/** Tab: 能力雷达图 */
function AbilitiesTab({ player }: { player: Player }) {
  const allPlayers = useMemo(() => getAllPlayersWithTeam(), [])

  // 同位置平均
  const samePositionAvg = useMemo(() => {
    const group = positionGroup(player.position)
    const same = allPlayers.filter((pt) => positionGroup(pt.player.position) === group)
    if (same.length === 0) return player.abilities

    const sum = same.reduce(
      (acc, pt) => {
        acc.shooting += pt.player.abilities.shooting
        acc.passing += pt.player.abilities.passing
        acc.dribbling += pt.player.abilities.dribbling
        acc.speed += pt.player.abilities.speed
        acc.defense += pt.player.abilities.defense
        acc.physical += pt.player.abilities.physical
        return acc
      },
      { shooting: 0, passing: 0, dribbling: 0, speed: 0, defense: 0, physical: 0 }
    )

    return {
      shooting: Math.round(sum.shooting / same.length),
      passing: Math.round(sum.passing / same.length),
      dribbling: Math.round(sum.dribbling / same.length),
      speed: Math.round(sum.speed / same.length),
      defense: Math.round(sum.defense / same.length),
      physical: Math.round(sum.physical / same.length),
    }
  }, [allPlayers, player.position])

  const chartData = RADAR_DIMENSIONS.map((d) => ({
    dimension: d.label,
    [player.name]: player.abilities[d.key],
    同位置平均: samePositionAvg[d.key],
    fullMark: 99,
  }))

  const posName = POSITIONS[player.position]?.name || player.position

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            六维能力雷达图
          </CardTitle>
          <CardDescription>
            位置：{posName} | 对比同位置平均能力值
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px] md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 99]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                />
                <Radar
                  name={player.name}
                  dataKey={player.name}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="同位置平均"
                  dataKey="同位置平均"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 能力明细表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">能力明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {RADAR_DIMENSIONS.map((d) => (
              <div key={d.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{d.label}</span>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {player.abilities[d.key]}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(player.abilities[d.key] / 99) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/** Tab: 职业生涯 */
function CareerTab({ player, team }: { player: Player; team: Team }) {
  const career = player.careerSummary

  return (
    <div className="space-y-6">
      {/* 国家队数据汇总 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            国家队生涯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-black text-primary tabular-nums">{career.totalCaps}</p>
              <p className="text-xs text-muted-foreground mt-1">国家队出场</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-black text-primary tabular-nums">{career.totalGoals}</p>
              <p className="text-xs text-muted-foreground mt-1">总进球</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-black text-primary tabular-nums">
                {career.majorTournaments.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">大赛参赛</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-semibold">{career.firstAppearance}</p>
              <p className="text-xs text-muted-foreground mt-1">国家队首秀</p>
            </div>
          </div>

          {career.majorTournaments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">参加大赛</p>
              <div className="flex flex-wrap gap-2">
                {career.majorTournaments.map((t, idx) => (
                  <Badge key={idx} variant="info">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 俱乐部时间轴 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            效力俱乐部
          </CardTitle>
        </CardHeader>
        <CardContent>
          {career.clubs.length === 0 ? (
            <EmptyState message="暂无俱乐部数据" />
          ) : (
            <div className="relative">
              {/* 时间轴竖线 */}
              <div className="absolute left-4 md:left-5 top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-6">
                {career.clubs.map((club, idx) => (
                  <motion.div
                    key={club.clubName + club.period}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    className="relative pl-10 md:pl-12"
                  >
                    {/* 时间轴圆点 */}
                    <div
                      className={cn(
                        "absolute left-2 md:left-3 w-5 h-5 rounded-full border-2 bg-card z-10",
                        idx === 0
                          ? "border-primary bg-primary/10"
                          : "border-muted-foreground/30"
                      )}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm md:text-base">
                          {club.clubName}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {club.period}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                        <span>
                          出场 <span className="font-semibold text-foreground">{club.appearances}</span>
                        </span>
                        <span>
                          进球 <span className="font-semibold text-foreground">{club.goals}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 主页面
// ============================================

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>()
  const data = useMemo(() => (id ? findPlayerById(id) : undefined), [id])

  if (!data) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-16">
              <EmptyState message="未找到该球员" icon="search" />
              <div className="flex justify-center mt-4">
                <Link to="/players">
                  <Button variant="outline">返回球员列表</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const { player, team } = data
  const posName = POSITIONS[player.position]?.name || player.position

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* 返回链接 */}
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回球员列表
        </Link>

        {/* 顶部信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* 球员照片 */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border-2 border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <User className="h-10 w-10 md:h-14 md:w-14 text-primary/60" />
                      <span className="text-[10px] text-muted-foreground mt-0.5">#{player.number}</span>
                    </div>
                  )}
                </div>

                {/* 姓名和基础信息 */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{player.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-4">
                    <div className="flex items-center gap-1.5">
                      <FlagImage code={team.flagCode} alt={team.name} size="sm" />
                      <span className="text-sm font-medium">{team.name}</span>
                    </div>
                    <Badge variant="info">{posName}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {player.club}
                    </span>
                  </div>
                  {/* 身价 */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {formatCurrency(player.marketValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 基本信息卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">全名</p>
                  <p className="font-medium">{player.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">国籍</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <FlagImage code={team.flagCode} alt={team.name} size="sm" />
                    {team.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    出生日期 / 年龄
                  </p>
                  <p className="font-medium">
                    {2026 - player.age}年 / {player.age}岁
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    身高 / 体重
                  </p>
                  <p className="font-medium">
                    {player.height}cm / {player.weight}kg
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Footprints className="h-3 w-3" />
                    惯用脚
                  </p>
                  <p className="font-medium">{player.preferredFoot}脚</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">身价</p>
                  <p className="font-medium text-primary">{formatCurrency(player.marketValue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">位置</p>
                  <p className="font-medium">{posName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">俱乐部</p>
                  <p className="font-medium">{player.club}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="performance">
            <TabsList className="mb-6 w-full md:w-auto overflow-x-auto">
              <TabsTrigger value="performance" className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">本届表现</span>
              </TabsTrigger>
              <TabsTrigger value="abilities" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">能力雷达图</span>
              </TabsTrigger>
              <TabsTrigger value="career" className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">职业生涯</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <PerformanceTab player={player} team={team} />
            </TabsContent>
            <TabsContent value="abilities">
              <AbilitiesTab player={player} />
            </TabsContent>
            <TabsContent value="career">
              <CareerTab player={player} team={team} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  )
}
