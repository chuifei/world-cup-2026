import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Users, Filter } from "lucide-react"
import { cn, fuzzyMatch } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { SearchInput } from "@/components/shared/SearchInput"
import { PlayerCard } from "@/components/shared/PlayerCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { useDebounce } from "@/hooks"
import { teams } from "@/data"
import { POSITIONS } from "@/constants"
import type { Player, Team } from "@/types"

// ============================================
// 常数
// ============================================

const POSITION_FILTERS = [
  { key: "全部", label: "全部位置" },
  { key: "GK", label: "门将" },
  { key: "DEF", label: "后卫" },
  { key: "MID", label: "中场" },
  { key: "FWD", label: "前锋" },
]

/** 判断位置属于哪个分组 */
function positionGroup(pos: string): string {
  if (pos === "GK") return "GK"
  if (["CB", "LB", "RB"].includes(pos)) return "DEF"
  if (["CDM", "CM", "CAM", "LM", "RM"].includes(pos)) return "MID"
  return "FWD"
}

// ============================================
// 工具
// ============================================

interface PlayerWithTeam {
  player: Player
  team: Team
}

/** 获取所有球员（带所属球队） */
function getAllPlayers(): PlayerWithTeam[] {
  const result: PlayerWithTeam[] = []
  for (const team of teams) {
    for (const player of team.players) {
      result.push({ player, team })
    }
  }
  return result
}

// ============================================
// 动画
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.04, ease: "easeOut" },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

// ============================================
// 组件
// ============================================

export default function Players() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "")
  const [selectedTeam, setSelectedTeam] = useState("全部")
  const [selectedPosition, setSelectedPosition] = useState("全部")

  const debouncedSearch = useDebounce(search, 300)

  const allPlayers = useMemo(() => getAllPlayers(), [])

  // 球队列表
  const teamOptions = useMemo(() => {
    const list = teams.map((t) => ({ id: t.id, name: t.name }))
    return [{ id: "全部", name: "全部球队" }, ...list]
  }, [])

  // 筛选
  const filteredPlayers = useMemo(() => {
    let result = allPlayers

    // 搜索（模糊匹配）
    if (debouncedSearch.trim()) {
      result = result.filter((pt) =>
        fuzzyMatch(debouncedSearch, [
          pt.player.name,
          pt.player.id,
          pt.team.name,
          pt.player.club,
          pt.player.nationality,
        ])
      )
    }

    // 球队
    if (selectedTeam !== "全部") {
      result = result.filter((pt) => pt.team.id === selectedTeam)
    }

    // 位置
    if (selectedPosition !== "全部") {
      result = result.filter((pt) => positionGroup(pt.player.position) === selectedPosition)
    }

    return result
  }, [allPlayers, debouncedSearch, selectedTeam, selectedPosition])

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">球员搜索</h1>
            <Badge variant="info">{allPlayers.length}名</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            浏览2026年世界杯所有参赛球员信息
          </p>
        </motion.div>

        {/* 筛选区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              {/* 搜索 */}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜索球员姓名、俱乐部..."
              />

              {/* 球队筛选 */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">按球队</p>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                >
                  {teamOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 位置筛选 */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">按位置</p>
                <div className="flex flex-wrap gap-2">
                  {POSITION_FILTERS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPosition(p.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                        selectedPosition === p.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 结果统计 */}
        <div className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            共 <span className="font-semibold text-foreground">{filteredPlayers.length}</span> 名球员
          </span>
        </div>

        {/* 球员Grid */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {filteredPlayers.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  message="未找到匹配的球员"
                  icon="search"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPlayers.map(({ player, team }, idx) => (
                <motion.div key={player.id} variants={fadeInUp} custom={idx}>
                  <PlayerCard
                    player={player}
                    teamName={team.name}
                    teamFlagCode={team.flagCode}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
