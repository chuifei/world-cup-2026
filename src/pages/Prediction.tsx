import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Trophy, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataNotice } from "@/components/shared/DataNotice"
import { DataStatusBadge } from "@/components/shared/DataStatusBadge"
import { teams, teamPredictions } from "@/data"
import type { Team, TeamPrediction } from "@/types"

// ============================================
// 工具函数
// ============================================

function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

/** 夺冠概率对应配色 */
function probabilityColor(pct: number): string {
  if (pct >= 14) return "bg-gradient-to-r from-amber-500 to-orange-500"
  if (pct >= 8) return "bg-gradient-to-r from-blue-500 to-indigo-500"
  if (pct >= 4) return "bg-gradient-to-r from-emerald-500 to-teal-500"
  return "bg-gradient-to-r from-gray-400 to-gray-500"
}

// ============================================
// 主页面
// ============================================

export default function Prediction() {
  // 按夺冠概率降序排列
  const sortedPredictions = useMemo(() => {
    return [...teamPredictions].sort((a, b) => b.winProbability - a.winProbability)
  }, [])

  // 最大概率值，用于计算进度条相对宽度
  const maxProb = useMemo(() => {
    return sortedPredictions.length > 0 ? sortedPredictions[0].winProbability : 100
  }, [sortedPredictions])

  // 动画
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* 页面标题 */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">AI 赛事预测</h1>
            <Badge variant="info">AI驱动</Badge>
            <DataStatusBadge status="simulated" />
          </div>
          <p className="text-sm text-muted-foreground">
            由于2026世界杯抽签尚未进行，无法做比赛级预测。以下为AI基于球队近期表现、阵容实力、
            历史战绩等多维度数据综合评估的夺冠概率，仅供参考。
          </p>
        </motion.div>

        {/* 数据说明 */}
        <DataNotice />

        {/* 夺冠概率总览 */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-amber-500" />
                球队夺冠概率
              </CardTitle>
              <CardDescription>
                AI 综合评估 Top {sortedPredictions.length} 夺冠热门球队（抽签后更新比赛级预测）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedPredictions.length === 0 ? (
                <EmptyState message="暂无预测数据" />
              ) : (
                <div className="space-y-6">
                  {sortedPredictions.map((pred, idx) => {
                    const team = getTeamById(pred.teamId)
                    if (!team) return null

                    return (
                      <motion.div
                        key={pred.teamId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          {/* 排名 */}
                          <span className="text-lg font-black text-muted-foreground/40 tabular-nums min-w-[2ch] text-center">
                            {idx + 1}
                          </span>

                          {/* 国旗 */}
                          <FlagImage code={team.flagCode} alt={team.name} size="md" />

                          {/* 队名 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm md:text-base">{team.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              FIFA #{team.fifaRank} · {team.nameEn}
                            </p>
                          </div>

                          {/* 夺冠概率 */}
                          <div className="text-right shrink-0">
                            <span className="text-xl md:text-2xl font-black text-primary tabular-nums">
                              {pred.winProbability}%
                            </span>
                          </div>
                        </div>

                        {/* 概率进度条 */}
                        <div className="h-3 rounded-full overflow-hidden bg-muted mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(pred.winProbability / maxProb) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.2 + idx * 0.05, ease: "easeOut" }}
                            className={cn("h-full rounded-full", probabilityColor(pred.winProbability))}
                          />
                        </div>

                        {/* 关键影响因素 */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Lightbulb className="h-3 w-3 text-amber-500" />
                            关键影响因素
                          </div>
                          <ul className="space-y-1">
                            {pred.keyFactors.map((factor, fi) => (
                              <li
                                key={fi}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0 mt-0.5">
                                  {fi + 1}
                                </span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
