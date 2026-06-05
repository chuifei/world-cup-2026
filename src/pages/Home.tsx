import { useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Trophy,
  Swords,
  MapPin,
  Users,
  ArrowRight,
  Calendar,
  Clock,
  Newspaper,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { PlayerCard } from "@/components/shared/PlayerCard"
import { StatCard } from "@/components/shared/StatCard"
import { FlagImage } from "@/components/shared/FlagImage"
import { DataNotice } from "@/components/shared/DataNotice"
import { DataStatusBadge } from "@/components/shared/DataStatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { teams, matches, news } from "@/data"
import type { Team, Player } from "@/types"

// 开幕日期：2026年6月11日
const OPENING_DATE = new Date("2026-06-11T00:00:00")

/** 计算距开幕还有多少天 */
function getCountdownDays(): number {
  const now = new Date()
  const diff = OPENING_DATE.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// 根据 teamId 查找球队
function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

// 明星球员列表 (playerId, teamId)
const STAR_PLAYERS = [
  { playerId: "mbappe", teamId: "france" },
  { playerId: "messi", teamId: "argentina" },
  { playerId: "ronaldo", teamId: "portugal" },
  { playerId: "kane", teamId: "england" },
  { playerId: "vinicius", teamId: "brazil" },
  { playerId: "salah", teamId: "egypt" },
  { playerId: "bellingham", teamId: "england" },
  { playerId: "musiala", teamId: "germany" },
]

// 热门参赛球队（预览卡片用）
const FEATURED_TEAM_IDS = [
  "argentina",
  "brazil",
  "france",
  "england",
  "germany",
  "portugal",
  "spain",
  "netherlands",
]

// 查找球员所属球队
function findPlayerTeam(playerId: string): { player: Player; team: Team } | null {
  for (const team of teams) {
    const player = team.players.find((p) => p.id === playerId)
    if (player) return { player, team }
  }
  return null
}

// 动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function Home() {
  const countdownDays = getCountdownDays()

  // 开幕相关比赛（前3场pending比赛）
  const openingMatches = useMemo(() => {
    return matches.filter((m) => m.status === "pending").slice(0, 3)
  }, [])

  // 明星球员数据
  const starPlayersData = useMemo(() => {
    return STAR_PLAYERS.map((sp) => findPlayerTeam(sp.playerId)).filter(
      Boolean
    ) as { player: Player; team: Team }[]
  }, [])

  // 热门球队数据
  const featuredTeams = useMemo(() => {
    return FEATURED_TEAM_IDS.map((id) => getTeamById(id)).filter(Boolean) as Team[]
  }, [])

  // 最新4条新闻
  const latestNews = useMemo(() => news.slice(0, 4), [])

  return (
    <main className="min-h-screen">
      {/* ==================== Hero 区域 ==================== */}
      <section
        className={cn(
          "relative min-h-[80vh] flex items-center justify-center overflow-hidden",
          "bg-gradient-to-b from-gray-950 via-gray-900 to-background"
        )}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          {/* 微妙的网格线 */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 小型徽章 */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full",
                "bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
              )}
            >
              <Trophy className="h-4 w-4" />
              第23届世界杯足球赛
            </span>

            {/* 主标题 */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="text-foreground">2026 </span>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                FIFA World Cup
              </span>
            </h1>

            {/* 副标题 -- 主办国 */}
            <p className="text-lg md:text-2xl text-muted-foreground mb-3">
              美国 · 加拿大 · 墨西哥
            </p>

            {/* 48支球队 */}
            <p className="text-sm md:text-base text-muted-foreground/70 mb-6">
              48支国家队 · 104场比赛 · 16座主办城市 · 为期40天的足球盛宴
            </p>

            {/* 赛事倒计时 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex flex-col items-center mb-10 px-8 py-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-primary/10 border border-amber-500/20"
            >
              <span className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                距2026年6月11日开幕还有
              </span>
              <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent tabular-nums">
                {countdownDays}
              </span>
              <span className="text-sm text-muted-foreground mt-1">天</span>
            </motion.div>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/matches">
                <Button size="lg" className="gap-2 min-w-[180px]">
                  <Swords className="h-5 w-5" />
                  查看赛程
                </Button>
              </Link>
              <Link to="/players">
                <Button variant="outline" size="lg" className="gap-2 min-w-[180px]">
                  <Users className="h-5 w-5" />
                  浏览球员
                </Button>
              </Link>
            </div>

            {/* 底部滚动提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-xs text-muted-foreground/50 mt-14"
            >
              向下滚动探索更多
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16">
        {/* ==================== DataNotice ==================== */}
        <DataNotice />

        {/* ==================== 开幕倒计时 ==================== */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">开幕倒计时</h2>
                <DataStatusBadge status="pending" />
              </div>
              <Link
                to="/matches"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                查看完整赛程 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              抽签尚未进行，具体对阵待FIFA公布。以下为已知的比赛日期框架与场馆信息。
            </p>

            {openingMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {openingMatches.map((match, idx) => {
                  const matchDate = new Date(match.date)
                  const daysUntil = Math.max(
                    0,
                    Math.ceil((matchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  )
                  return (
                    <motion.div key={match.id} variants={fadeInUp} custom={idx}>
                      <Card className="h-full hover:border-primary/20 transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="info">{match.round}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {matchDate.toLocaleDateString("zh-CN", {
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-center py-4 text-7xl font-extrabold text-primary/20">
                            VS
                          </div>
                          <div className="text-center space-y-1 mt-2">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {match.venue}
                            </p>
                            <p className="text-xs text-muted-foreground">{match.city}</p>
                          </div>
                          {idx === 0 && (
                            <div className="mt-3 pt-3 border-t border-border text-center">
                              <span className="text-lg font-bold text-amber-500 tabular-nums">
                                {daysUntil}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">天后开幕</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState message="暂无赛程数据" />
            )}
          </motion.div>
        </section>

        {/* ==================== 数据快览 Banner ==================== */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <motion.div variants={fadeInUp} custom={0}>
                <StatCard label="参赛球队" value={48} icon="🏆" />
              </motion.div>
              <motion.div variants={fadeInUp} custom={1}>
                <StatCard label="比赛场次" value={104} icon="⚽" />
              </motion.div>
              <motion.div variants={fadeInUp} custom={2}>
                <StatCard label="举办城市" value={16} icon="🏟️" />
              </motion.div>
              <motion.div variants={fadeInUp} custom={3}>
                <StatCard label="参赛球员" value={1100} suffix="+" icon="👥" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ==================== 参赛球队预览 ==================== */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">热门球队预览</h2>
                <DataStatusBadge status="pending" />
              </div>
              <Link
                to="/teams"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                查看全部球队 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              48支参赛球队已确定晋级，小组抽签尚未进行。以下为部分热门球队预览。
            </p>

            {featuredTeams.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredTeams.map((team, idx) => (
                  <motion.div key={team.id} variants={fadeInUp} custom={idx}>
                    <Link to={`/teams/${team.id}`} className="block h-full">
                      <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <FlagImage
                              code={team.flagCode}
                              alt={team.name}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {team.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {team.nameEn}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0" />
                          </div>
                          <div className="mt-3 pt-3 border-t border-border space-y-1">
                            <p className="text-xs text-muted-foreground">
                              世界排名：第<span className="text-foreground font-medium">{team.fifaRank}</span> 位
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              最佳战绩：{team.bestResult}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState message="暂无球队数据" />
            )}
          </motion.div>
        </section>

        {/* ==================== 明星球员推荐 ==================== */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">明星球员</h2>
              </div>
              <Link
                to="/players"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                查看全部球员 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {starPlayersData.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {starPlayersData.map(({ player, team }, idx) => (
                  <motion.div key={player.id} variants={fadeInUp} custom={idx}>
                    <PlayerCard
                      player={player}
                      teamName={team.name}
                      teamFlagCode={team.flagCode}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState message="暂无球员数据" />
            )}
          </motion.div>
        </section>

        {/* ==================== 最新新闻 ==================== */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="h-5 w-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">最新新闻</h2>
              </div>
            </div>

            {latestNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestNews.map((item, idx) => (
                  <motion.div key={item.id} variants={fadeInUp} custom={idx}>
                    <Card className="h-full hover:border-primary/20 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              item.category === "赛事"
                                ? "info"
                                : item.category === "球员"
                                ? "success"
                                : item.category === "球队"
                                ? "warning"
                                : "default"
                            }
                          >
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {item.summary}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState message="暂无新闻数据" />
            )}
          </motion.div>
        </section>
      </div>
    </main>
  )
}
