import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Users, Search } from "lucide-react"
import { cn, fuzzyMatch } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { SearchInput } from "@/components/shared/SearchInput"
import { TeamCard } from "@/components/shared/TeamCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { teams } from "@/data"
import { CONFEDERATIONS } from "@/constants"
import type { Team } from "@/types"

// ============================================
// 常数
// ============================================

const CONFEDERATION_LIST = [
  { key: "全部", label: "全部", color: "#6B7280" },
  ...Object.entries(CONFEDERATIONS).map(([key, val]) => ({
    key,
    label: val.name,
    color: val.color,
  })),
]

// ============================================
// 组件
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function Teams() {
  const [search, setSearch] = useState("")
  const [confederation, setConfederation] = useState("全部")

  // 筛选并排序球队（按FIFA排名升序）
  const filteredTeams = useMemo(() => {
    let result: Team[] = teams

    // 搜索（模糊匹配）
    if (search.trim()) {
      result = result.filter((t) =>
        fuzzyMatch(search, [t.name, t.nameEn, t.id])
      )
    }

    // 洲际
    if (confederation !== "全部") {
      result = result.filter((t) => t.confederation === confederation)
    }

    // 按 FIFA 排名升序排列
    result = [...result].sort((a, b) => a.fifaRank - b.fifaRank)

    return result
  }, [search, confederation])

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
            <h1 className="text-2xl md:text-3xl font-bold">参赛球队</h1>
            <Badge variant="info">48支</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            2026年世界杯48支参赛球队信息一览（按FIFA排名排列）
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
                placeholder="搜索球队名称..."
              />

              {/* 洲际筛选 */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">按洲际</p>
                <div className="flex flex-wrap gap-2">
                  {CONFEDERATION_LIST.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setConfederation(c.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                        confederation === c.key
                          ? "text-white border-transparent"
                          : "text-muted-foreground border-border hover:border-primary/30 bg-card"
                      )}
                      style={
                        confederation === c.key
                          ? { backgroundColor: c.color }
                          : undefined
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 球队Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  message="未找到匹配的球队"
                  icon="search"
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  共 <span className="font-semibold text-foreground">{filteredTeams.length}</span> 支球队
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTeams.map((team, idx) => (
                  <motion.div key={team.id} variants={fadeInUp} custom={idx}>
                    <TeamCard team={team} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  )
}
