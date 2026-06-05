import { useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Users,
  Trophy,
  Clock,
  MapPin,
  Shirt,
  User,
  PieChart,
  History,
  ChevronRight,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataStatusBadge } from "@/components/shared/DataStatusBadge"
import { teams } from "@/data"
import { CONFEDERATIONS, POSITIONS } from "@/constants"
import type { Team, Player, WorldCupHistory } from "@/types"

// ============================================
// 工具函数
// ============================================

function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

/** 预选赛状态标签配置 */
const QUAL_STATUS_CONFIG: Record<
  Team["qualificationStatus"],
  { label: string; variant: "success" | "warning" | "info" }
> = {
  qualified: { label: "已晋级", variant: "success" },
  in_progress: { label: "预选赛进行中", variant: "warning" },
  pending: { label: "待定", variant: "info" },
}

// ============================================
// 子组件
// ============================================

/** Tab: 球队概况 */
function OverviewTab({ team }: { team: Team }) {
  const conf = CONFEDERATIONS[team.confederation]
  const qualStatus = QUAL_STATUS_CONFIG[team.qualificationStatus]
  const dataStatusText = team.dataStatus === "real" ? "历史数据" : "数据待确认"

  return (
    <div className="space-y-6">
      {/* 数据状态说明 */}
      <div className="flex items-center gap-2">
        <DataStatusBadge status={team.dataStatus === "real" ? "real" : "pending"} />
        <span className="text-xs text-muted-foreground">{dataStatusText}</span>
      </div>

      {/* 基本资料卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">FIFA排名</span>
            </div>
            <span className="text-2xl font-black text-primary">#{team.fifaRank}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <History className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">世界杯参赛</span>
            </div>
            <span className="text-2xl font-black text-primary">{team.worldCupAppearances}届</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">历届最佳</span>
            </div>
            <span className="text-sm font-bold truncate">{team.bestResult}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-xs text-muted-foreground">预选赛</span>
            </div>
            <Badge variant={qualStatus.variant}>{qualStatus.label}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* 主教练 + 常用阵型 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              主教练
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{team.coach.name}</p>
                <p className="text-sm text-muted-foreground">{team.coach.nationality || ""}</p>
              </div>
            </div>
            {team.coach.trophyCount !== undefined && (
              <p className="text-sm text-muted-foreground">
                执教荣誉：共获得 {team.coach.trophyCount} 项冠军
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shirt className="h-4 w-4 text-primary" />
              常用阵型
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <span className="text-5xl font-black text-primary tracking-widest">{team.formation}</span>
              <p className="text-sm text-muted-foreground mt-3">主要战术阵型</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最新一届历史成绩预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            上届世界杯成绩
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.historyResults.length === 0 ? (
            <EmptyState message="暂无历史数据" />
          ) : (
            (() => {
              const latest = team.historyResults.sort((a, b) => b.year - a.year)[0]
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">年份</p>
                    <p className="text-xl font-black text-primary">{latest.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">成绩</p>
                    <Badge
                      variant={
                        latest.result === "冠军"
                          ? "success"
                          : latest.result.includes("亚军") || latest.result.includes("季军")
                          ? "warning"
                          : "default"
                      }
                    >
                      {latest.result}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">东道主</p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {latest.host}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">赛果</p>
                    <p className="font-semibold">
                      <span className="text-green-500">{latest.wins}胜</span>
                      {" / "}
                      <span className="text-gray-400">{latest.draws}平</span>
                      {" / "}
                      <span className="text-red-500">{latest.losses}负</span>
                    </p>
                  </div>
                </div>
              )
            })()
          )}
        </CardContent>
      </Card>

      {/* 说明：本届赛事未开始 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold">!</span>
            2026世界杯尚未开赛，抽签仪式将在赛前举行。本页面仅展示球队基本资料和历届历史成绩。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/** Tab: 球员名单 */
function PlayersTab({ team }: { team: Team }) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent className="p-0">
        {team.players.length === 0 ? (
          <div className="p-8">
            <EmptyState message="暂无球员数据" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">号码</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">球员</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">位置</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">俱乐部</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">年龄</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">身价</th>
                </tr>
              </thead>
              <tbody>
                {team.players
                  .sort((a, b) => a.number - b.number)
                  .map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => navigate(`/players/${player.id}`)}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {player.number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{player.name}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-muted-foreground">
                          {POSITIONS[player.position]?.name || player.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-muted-foreground">{player.club}</span>
                      </td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className="text-muted-foreground">{player.age}岁</span>
                      </td>
                      <td className="py-3 px-4 text-right hidden lg:table-cell">
                        <span className="text-primary font-medium">{formatCurrency(player.marketValue)}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** Tab: 历史成绩 */
function HistoryTab({ team }: { team: Team }) {
  const sorted = useMemo(
    () => [...team.historyResults].sort((a, b) => b.year - a.year),
    [team.historyResults]
  )

  return (
    <Card>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8">
            <EmptyState message="暂无历史数据" />
          </div>
        ) : (
          <div className="relative">
            {/* 时间轴 */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border" />
            <div className="divide-y divide-border/50">
              {sorted.map((record, idx) => (
                <motion.div
                  key={record.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative pl-14 md:pl-16 py-5 pr-4"
                >
                  {/* 时间轴圆点 */}
                  <div
                    className={cn(
                      "absolute left-4 md:left-6 w-5 h-5 rounded-full border-2 border-primary bg-card z-10",
                      record.result === "冠军" && "bg-amber-400 border-amber-500"
                    )}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xl font-black text-primary">{record.year}</span>
                      <Badge
                        variant={
                          record.result === "冠军"
                            ? "success"
                            : record.result.includes("亚军") || record.result.includes("季军")
                            ? "warning"
                            : "default"
                        }
                      >
                        {record.result}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.host}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">场次</span>
                        <p className="font-semibold">{record.matchesPlayed}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">胜/平/负</span>
                        <p className="font-semibold">
                          <span className="text-green-500">{record.wins}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-gray-400">{record.draws}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-red-500">{record.losses}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">进球</span>
                        <p className="font-semibold">{record.goalsFor}</p>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-muted-foreground text-xs">失球</span>
                        <p className="font-semibold">{record.goalsAgainst}</p>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-muted-foreground text-xs">净胜球</span>
                        <p className="font-semibold">{record.goalsFor - record.goalsAgainst}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// 主页面
// ============================================

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>()
  const team = useMemo(() => (id ? getTeamById(id) : undefined), [id])

  if (!team) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-16">
              <EmptyState message="未找到该球队" icon="search" />
              <div className="flex justify-center mt-4">
                <Link to="/teams">
                  <Button variant="outline">返回球队列表</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const conf = CONFEDERATIONS[team.confederation]

  return (
    <main className="min-h-screen">
      {/* 顶部横幅 */}
      <div className="relative bg-gradient-to-b from-gray-900 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* 返回按钮 */}
          <Link
            to="/teams"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回球队列表
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <FlagImage code={team.flagCode} alt={team.name} size="xl" className="!w-24 !h-auto" />
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-2 flex-wrap justify-center sm:justify-start">
                <h1 className="text-2xl md:text-4xl font-bold">{team.name}</h1>
                <Badge
                  className="text-white"
                  style={{ backgroundColor: conf?.color || "#6B7280" }}
                >
                  {conf?.name || team.confederation}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm md:text-base mb-4">{team.nameEn}</p>
              <div className="flex flex-wrap gap-3 md:gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">FIFA排名: </span>
                  <span className="font-semibold">#{team.fifaRank}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">主教练: </span>
                  <span className="font-semibold">{team.coach.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">参赛: </span>
                  <span className="font-semibold">{team.worldCupAppearances}届</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">最佳: </span>
                  <span className="font-semibold">{team.bestResult}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">球队概况</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">球员名单</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">历史成绩</span>
            </TabsTrigger>
          </TabsList>

          <motion.div
            key="overview-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview">
              <OverviewTab team={team} />
            </TabsContent>
            <TabsContent value="players">
              <PlayersTab team={team} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab team={team} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </main>
  )
}
