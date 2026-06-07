import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Trophy, Lightbulb, Target, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataNotice } from "@/components/shared/DataNotice"
import { DataStatusBadge } from "@/components/shared/DataStatusBadge"
import { LoginPrompt } from "@/components/shared/LoginPrompt"
import { useAuth } from "@/hooks/useAuth"
import { getTeams, getMatches, getUserStats, getUserPredictions, submitPrediction } from "@/services/client"
import type { Team, TeamPrediction, UserPredictionRecord } from "@/types"

function probabilityColor(pct: number): string {
  if (pct >= 14) return "bg-gradient-to-r from-amber-500 to-orange-500"
  if (pct >= 8) return "bg-gradient-to-r from-blue-500 to-indigo-500"
  if (pct >= 4) return "bg-gradient-to-r from-emerald-500 to-teal-500"
  return "bg-gradient-to-r from-gray-400 to-gray-500"
}

export default function Prediction() {
  const { auth, login, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [myPredictions, setMyPredictions] = useState<UserPredictionRecord[]>([])
  const [myStats, setMyStats] = useState<{ total: number; correct: number; winRate: number; totalPoints: number } | null>(null)
  const [pendingMatches, setPendingMatches] = useState<Array<{ id: string; homeTeamId: string; awayTeamId: string; date: string; group: string }>>([])
  const [predForm, setPredForm] = useState<Record<string, { home: number; away: number; confidence: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [teamsData, matchesData] = await Promise.all([
          getTeams() as Promise<Team[]>,
          getMatches({ status: 'pending' }) as Promise<Array<{ id: string; homeTeamId: string; awayTeamId: string; date: string; group: string }>>,
        ])
        setTeams(teamsData)
        setPendingMatches(matchesData)
      } catch { /* API unavailable, use empty data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (auth) {
      (getUserPredictions() as Promise<UserPredictionRecord[]>).then(setMyPredictions).catch(() => {})
      ;(getUserStats() as Promise<{ total: number; correct: number; winRate: number; totalPoints: number }>).then(setMyStats).catch(() => {})
    } else {
      setMyPredictions([])
      setMyStats(null)
    }
  }, [auth])

  const sortedPredictions = useMemo(() => {
    const teamPreds: TeamPrediction[] = [] // Fallback if no data
    return [...teamPreds].sort((a, b) => b.winProbability - a.winProbability)
  }, [])

  const maxProb = sortedPredictions.length > 0 ? sortedPredictions[0].winProbability : 100

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  async function handleSubmitPrediction(matchId: string) {
    const form = predForm[matchId]
    if (!form || !auth) return

    const homeId = pendingMatches.find(m => m.id === matchId)?.homeTeamId || ''
    const awayId = pendingMatches.find(m => m.id === matchId)?.awayTeamId || ''
    const predictedResult = form.home > form.away ? 'home_win' as const : form.home < form.away ? 'away_win' as const : 'draw' as const

    await submitPrediction({
      matchId,
      predictedHomeScore: form.home,
      predictedAwayScore: form.away,
      predictedResult,
      confidence: form.confidence,
    })

    const preds = await getUserPredictions() as UserPredictionRecord[]
    setMyPredictions(preds)
    const stats = await getUserStats() as { total: number; correct: number; winRate: number; totalPoints: number }
    setMyStats(stats)
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">赛事预测</h1>
            <Badge variant="info">AI驱动</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            输入用户名参与比赛预测，检验你的足球判断力！无需注册和密码。
          </p>
        </motion.div>

        {/* 用户状态 */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card>
            <CardContent className="py-4">
              {auth ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{auth.username}</p>
                      {myStats && (
                        <p className="text-xs text-muted-foreground">
                          {myStats.total} 次预测 · 正确 {myStats.correct} 次 · 胜率 {myStats.winRate}% · {myStats.totalPoints} 积分
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 transition">
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">输入用户名即可参与预测</p>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    输入用户名
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 待预测比赛 */}
        {pendingMatches.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-green-500" />
                  待预测比赛
                </CardTitle>
                <CardDescription>选择比分提交你的预测（仅限未开始比赛）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingMatches.slice(0, 10).map((match) => {
                    const homeTeam = teams.find(t => t.id === match.homeTeamId)
                    const awayTeam = teams.find(t => t.id === match.awayTeamId)
                    const existingPred = myPredictions.find(p => p.matchId === match.id)
                    const form = predForm[match.id] || { home: 0, away: 0, confidence: 3 }

                    return (
                      <div key={match.id} className="p-4 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-2">
                          {match.group}组 · {new Date(match.date).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          {homeTeam && <FlagImage code={homeTeam.flagCode} alt={homeTeam.name} size="sm" />}
                          <span className="font-bold">{homeTeam?.name || match.homeTeamId}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-bold">{awayTeam?.name || match.awayTeamId}</span>
                          {awayTeam && <FlagImage code={awayTeam.flagCode} alt={awayTeam.name} size="sm" />}
                        </div>
                        {existingPred ? (
                          <div className="text-sm text-green-600 font-medium">
                            已预测: {existingPred.predictedHomeScore} - {existingPred.predictedAwayScore}
                          </div>
                        ) : auth ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min={0} max={20}
                              value={form.home}
                              onChange={(e) => setPredForm({ ...predForm, [match.id]: { ...form, home: Number(e.target.value) } })}
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 bg-white"
                            />
                            <span className="text-sm text-muted-foreground">-</span>
                            <input
                              type="number" min={0} max={20}
                              value={form.away}
                              onChange={(e) => setPredForm({ ...predForm, [match.id]: { ...form, away: Number(e.target.value) } })}
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 bg-white"
                            />
                            <select
                              value={form.confidence}
                              onChange={(e) => setPredForm({ ...predForm, [match.id]: { ...form, confidence: Number(e.target.value) } })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white"
                            >
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                            </select>
                            <button
                              onClick={() => handleSubmitPrediction(match.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                            >
                              预测
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowLogin(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 transition"
                          >
                            登录后参与预测
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 夺冠概率总览（原有功能） */}
        {sortedPredictions.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  球队夺冠概率
                </CardTitle>
                <CardDescription>AI 综合评估 Top {sortedPredictions.length} 夺冠热门球队</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sortedPredictions.map((pred, idx) => {
                    const team = teams.find(t => t.id === pred.teamId)
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
                          <span className="text-lg font-black text-muted-foreground/40 tabular-nums min-w-[2ch] text-center">
                            {idx + 1}
                          </span>
                          <FlagImage code={team.flagCode} alt={team.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm md:text-base">{team.name}</h3>
                            <p className="text-xs text-muted-foreground">FIFA #{team.fifaRank} · {team.nameEn}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xl md:text-2xl font-black text-primary tabular-nums">
                              {pred.winProbability}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden bg-muted mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(pred.winProbability / maxProb) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.2 + idx * 0.05, ease: "easeOut" }}
                            className={cn("h-full rounded-full", probabilityColor(pred.winProbability))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Lightbulb className="h-3 w-3 text-amber-500" />
                            关键影响因素
                          </div>
                          <ul className="space-y-1">
                            {pred.keyFactors.map((factor, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <LoginPrompt isOpen={showLogin} onLogin={async (username) => { await login(username); setShowLogin(false) }} />
    </main>
  )
}
