import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Youtube,
  Tv,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trophy,
  Zap,
  Info,
  List,
  LayoutGrid,
  Monitor,
  Smartphone,
  Radio,
} from "lucide-react"
import { cn, formatNumber, formatBeijingTime } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { FlagImage } from "@/components/shared/FlagImage"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataNotice } from "@/components/shared/DataNotice"
import { matches } from "@/data/matches"
import { venues } from "@/data/venues"
import { TOURNAMENT_INFO } from "@/constants"
import type { Match, Venue } from "@/types"

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

// ==================== Tab1: 赛程日历 ====================

interface CalendarMatchDay {
  date: Date
  matches: Match[]
}

function ScheduleCalendar() {
  const today = new Date(2026, 5, 11) // June 2026
  const [currentMonth, setCurrentMonth] = useState(5) // 0-based: 5=June, 6=July
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  const year = 2026

  // 按月分组比赛
  const matchMap = useMemo(() => {
    const map = new Map<string, Match[]>()
    matches.forEach((m) => {
      const key = m.date.slice(0, 10)
      const arr = map.get(key) || []
      arr.push(m)
      map.set(key, arr)
    })
    return map
  }, [])

  // 有比赛的日期集合
  const matchDates = useMemo(() => new Set(matchMap.keys()), [matchMap])

  // 当月有比赛的日期（排好序）
  const monthlyMatches = useMemo(() => {
    const result: CalendarMatchDay[] = []
    matchMap.forEach((ms, dateStr) => {
      const d = new Date(dateStr)
      if (d.getFullYear() === year && d.getMonth() === currentMonth) {
        result.push({ date: d, matches: ms })
      }
    })
    result.sort((a, b) => a.date.getTime() - b.date.getTime())
    return result
  }, [currentMonth, matchMap])

  // 生成月历 grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, currentMonth, 1)
    const lastDay = new Date(year, currentMonth + 1, 0)
    const startDow = firstDay.getDay() // 0=Sun
    const daysInMonth = lastDay.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    return cells
  }, [currentMonth])

  const goPrevMonth = () => {
    if (currentMonth === 5) return
    setCurrentMonth((m) => m - 1)
    setSelectedDate(null)
  }
  const goNextMonth = () => {
    if (currentMonth === 6) return
    setCurrentMonth((m) => m + 1)
    setSelectedDate(null)
  }

  const monthLabel = currentMonth === 5 ? "2026年6月" : "2026年7月"
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

  // 当天选中的日期 key
  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null
  const selectedMatches = selectedKey ? matchMap.get(selectedKey) || [] : []

  // 按场地分组排序（同日多场）
  const sortedSelectedMatches = useMemo(() => {
    return [...selectedMatches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [selectedMatches])

  // 列表视图用的全部赛事 按日期排序
  const sortedAllMatches = useMemo(() => {
    return [...matches]
      .filter((m) => {
        const d = new Date(m.date)
        return d.getFullYear() === year && d.getMonth() === currentMonth
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [currentMonth])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-6"
    >
      {/* 月份切换 + 视图切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goPrevMonth} disabled={currentMonth === 5}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[120px] text-center">{monthLabel}</h3>
          <Button variant="outline" size="sm" onClick={goNextMonth} disabled={currentMonth === 6}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200",
              viewMode === "calendar" && "bg-background text-foreground shadow-sm"
            )}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            月历
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200",
              viewMode === "list" && "bg-background text-foreground shadow-sm"
            )}
          >
            <List className="h-4 w-4 mr-1" />
            列表
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="space-y-4">
          {/* 周标题 */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((wd) => (
              <div key={wd} className="text-xs font-medium text-muted-foreground py-2">
                {wd}
              </div>
            ))}
          </div>

          {/* 日期 grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />
              }
              const dateStr = `${year}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const hasMatch = matchDates.has(dateStr)
              const isSelected = selectedKey === dateStr
              const isPast = new Date(dateStr) < new Date()

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    if (hasMatch) {
                      setSelectedDate(new Date(year, currentMonth, day))
                    }
                  }}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-200",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : hasMatch
                        ? "bg-accent hover:bg-accent/80 cursor-pointer"
                        : "text-muted-foreground cursor-default"
                  )}
                >
                  <span className={cn("font-medium", isSelected && "text-primary-foreground")}>
                    {day}
                  </span>
                  {hasMatch && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-yellow-500"
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* 选中日期的比赛列表 */}
          <AnimatePresence mode="wait">
            {selectedMatches.length > 0 && (
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {selectedKey} 比赛 ({selectedMatches.length}场)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sortedSelectedMatches.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="text-xs text-muted-foreground w-14 shrink-0">
                          {formatBeijingTime(m.date)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{m.homeTeamId}</span>
                          <span className="mx-1 text-muted-foreground">vs</span>
                          <span className="font-medium text-sm">{m.awayTeamId}</span>
                          {m.homeScore !== null && (
                            <span className="ml-2 text-sm font-bold text-primary">
                              {m.homeScore}:{m.awayScore}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <MapPin className="h-3 w-3" />
                          {m.venue}
                        </div>
                        <Badge
                          variant={
                            m.status === "live" ? "live" : m.status === "finished" ? "success" : "info"
                          }
                          className="shrink-0"
                        >
                          {m.status === "live" ? "直播中" : m.status === "finished" ? "已结束" : m.round}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedMatches.length === 0 && selectedDate && (
            <p className="text-center text-muted-foreground text-sm py-4">该日期暂无比赛</p>
          )}
        </div>
      ) : (
        /* 列表视图 */
        <div className="space-y-2">
          {sortedAllMatches.length === 0 ? (
            <EmptyState message="本月暂无比赛" icon="data" />
          ) : (
            sortedAllMatches.map((m, i) => (
              <motion.div
                key={m.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="text-xs text-muted-foreground w-20 shrink-0">
                  {formatBeijingTime(m.date)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{m.homeTeamId}</span>
                  <span className="mx-1 text-muted-foreground">vs</span>
                  <span className="font-medium text-sm">{m.awayTeamId}</span>
                  {m.homeScore !== null && (
                    <span className="ml-2 text-sm font-bold text-primary">
                      {m.homeScore}:{m.awayScore}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <MapPin className="h-3 w-3" />
                  {m.city}
                </div>
                <Badge
                  variant={
                    m.status === "live" ? "live" : m.status === "finished" ? "success" : "info"
                  }
                  className="shrink-0"
                >
                  {m.status === "live" ? "直播中" : m.status === "finished" ? "已结束" : m.round}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  )
}

// ==================== Tab2: 直播渠道 ====================

interface BroadcastPlatform {
  name: string
  icon: React.ReactNode
  type: "直播" | "点播" | "直播+点播"
  coverage: string
  free: boolean
  url: string
  desc: string
}

const broadcastPlatforms: BroadcastPlatform[] = [
  {
    name: "CCTV5",
    icon: <Tv className="h-6 w-6" />,
    type: "直播",
    coverage: "全国",
    free: true,
    url: "#",
    desc: "中央广播电视总台体育频道，提供全部104场比赛直播及赛事报道。",
  },
  {
    name: "CCTV5+",
    icon: <Monitor className="h-6 w-6" />,
    type: "直播",
    coverage: "全国",
    free: true,
    url: "#",
    desc: "中央广播电视总台体育赛事频道，高清赛事直播，多角度赛事分析。",
  },
  {
    name: "咪咕视频",
    icon: <Smartphone className="h-6 w-6" />,
    type: "直播+点播",
    coverage: "全国",
    free: false,
    url: "#",
    desc: "中国移动旗下视频平台，4K超高清直播，多机位观看 + 赛后回放。",
  },
  {
    name: "优酷体育",
    icon: <Youtube className="h-6 w-6" />,
    type: "直播+点播",
    coverage: "全国",
    free: false,
    url: "#",
    desc: "阿里旗下体育直播平台，提供全场次直播、精彩集锦和专业解说。",
  },
  {
    name: "抖音",
    icon: <Radio className="h-6 w-6" />,
    type: "直播+点播",
    coverage: "全国",
    free: true,
    url: "#",
    desc: "抖音体育频道提供短视频集锦、实时战报和部分场次免费直播。",
  },
]

function BroadcastTab() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      <DataNotice />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {broadcastPlatforms.map((p, i) => (
          <motion.div key={p.name} custom={i} variants={fadeInUp}>
            <Card className="h-full hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {p.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription>{p.desc.slice(0, 30)}...</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{p.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {p.coverage}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={p.free ? "success" : "warning"}>
                      {p.free ? "免费" : "付费"}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  前往观看
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== Tab3: 世界杯百科 ====================

interface WikiArticle {
  id: string
  title: string
  summary: string
  readTime: number // 分钟
  content: string
  icon: React.ReactNode
}

const wikiArticles: WikiArticle[] = [
  {
    id: "format",
    title: "赛制说明",
    summary: "全面了解2026世界杯48队参赛赛制、小组赛到淘汰赛的完整晋级规则。",
    readTime: 5,
    icon: <Trophy className="h-5 w-5" />,
    content: `2026年世界杯将首次扩军至48支参赛球队，是世界杯历史上最大规模的一届赛事。

## 小组赛阶段
- 48支球队分为12个小组（A-L组），每组4支球队
- 小组赛采用单循环赛制，每组共进行6场比赛
- 小组前两名直接晋级（共24支球队）
- 8个成绩最好的小组第三名也将晋级（共8支）
- 合计32支球队进入淘汰赛阶段

## 淘汰赛阶段
- 32强赛（1/16决赛）→ 16强赛 → 8强赛 → 半决赛 → 决赛
- 淘汰赛阶段每场比赛必须决出胜负
- 常规时间打平进入加时赛（30分钟）
- 加时赛仍平则进行点球大战

## 比赛时间
- 小组赛阶段每场比赛90分钟（上下半场各45分钟）
- 淘汰赛阶段可能延长至120分钟（含加时赛）

## 换人规则
- 每队最多可进行5次换人（3次常规换人窗口 + 中场休息）
- 加时赛可额外增加1次换人`,
  },
  {
    id: "rules",
    title: "规则解读",
    summary: "越位、手球、VAR等最新规则变化详解，助你轻松看懂比赛。",
    readTime: 6,
    icon: <BookOpen className="h-5 w-5" />,
    content: `## 越位规则
- 球员处于越位位置不等于越位犯规
- 在队友传球的瞬间，接球球员的身体任何有效部位（除手臂外）比倒数第二名防守球员更靠近对方球门线
- 不会因手部和臂部而越位

## 手球规则
- 故意用手/手臂触球属于犯规
- 身体面积不自然地扩大导致手球属于犯规
- 进球前进攻方手球（即使意外）将判进球无效

## 黄牌与红牌
- 黄牌：警告，同一场比赛累计两张黄牌变为红牌罚下
- 红牌：直接罚下，球员不得继续参加本场比赛
- 小组赛累计两张黄牌停赛一场

## VAR（视频助理裁判）
- 仅在以下四种情形介入：
  1. 进球/不进球判定
  2. 点球/不点球判定
  3. 直接红牌判定
  4. 判罚对象错误
- 半自动越位技术辅助越位判罚`,
  },
  {
    id: "var",
    title: "VAR技术详解",
    summary: "视频助理裁判系统的工作原理、使用场景及争议案例解析。",
    readTime: 4,
    icon: <Zap className="h-5 w-5" />,
    content: `## VAR团队组成
- 1名视频助理裁判（VAR）
- 1-3名助理视频助理裁判（AVAR）
- 比赛官员通过耳机通讯系统沟通

## 半自动越位技术
- 球场屋顶安装12台追踪摄像头
- 每秒50次追踪球员29个数据点
- 球内内置惯性测量单元（IMU）
- 检测到越位后自动通知VAR团队
- 生成3D动画在球场大屏和电视转播中展示

## 判罚流程
1. 场上裁判做出初始判罚
2. VAR团队回看视频并建议复核
3. 裁判可到场边监视器观看回放
4. 裁判做出最终决定

## 2026世界杯VAR新变化
- 裁判判罚说明将通过球场广播系统现场播报
- 3D越位动画将在球场大屏实时展示`,
  },
  {
    id: "history",
    title: "世界杯历史知识",
    summary: "从1930年首届乌拉圭世界杯到2022年卡塔尔世界杯的百年辉煌历程。",
    readTime: 8,
    icon: <Clock className="h-5 w-5" />,
    content: `## 世界杯的诞生
- 1930年首届世界杯在乌拉圭举办，仅13支球队参赛
- 乌拉圭在决赛中4-2击败阿根廷，成为首个世界杯冠军

## 世界杯的演变
- 1934年：首次引入预选赛制度
- 1950年：二战后世界杯重启，巴西马拉卡纳惨案
- 1970年：首次使用红黄牌制度，首次允许换人
- 1982年：扩军至24支球队
- 1998年：扩军至32支球队
- 2018年：首次引入VAR技术
- 2022年：首次在北半球冬季举办
- 2026年：扩军至48支球队

## 经典时刻
- 1958年：17岁的贝利横空出世
- 1970年：巴西永久保留雷米特杯
- 1986年：马拉多纳"上帝之手"与"世纪进球"
- 1998年：齐达内决赛双响助法国首冠
- 2014年：德国7-1巴西（米内罗惨案）
- 2022年：梅西加冕球王之战`,
  },
  {
    id: "funfacts",
    title: "趣味数据",
    summary: "世界杯历史上的奇闻轶事、惊人数据和有趣的小知识。",
    readTime: 3,
    icon: <Info className="h-5 w-5" />,
    content: `## 进球纪录
- 世界杯总进球纪录：克洛泽16球（德国）
- 单届进球纪录：方丹13球（1958年，法国）
- 最快进球：哈坎·苏克11秒（2002年）
- 最大比分：匈牙利10-1萨尔瓦多（1982年）

## 参赛纪录
- 最多参赛届数：巴西22届（全勤）
- 最多出场场次：梅西26场
- 最年长球员：埃萨姆·哈达里45岁（2018年）
- 最年轻进球者：贝利17岁239天（1958年）

## 冠军纪录
- 最多冠军：巴西5次
- 连续夺冠：意大利(1934,1938)、巴西(1958,1962)
- 东道主夺冠：乌拉圭、意大利、英格兰、西德、阿根廷、法国

## 世界杯趣闻
- 世界杯奖杯曾被偷走两次（1966年英格兰、1983年巴西）
- 1930年决赛用球由阿根廷提供（上半场阿根廷2-1领先），下半场换成乌拉圭的球（乌拉圭最终4-2夺冠）
- 世界杯唯一一次三四名决赛进球数超过决赛：1958年（三四名决赛法国6-3西德，决赛巴西5-2瑞典）`,
  },
]

function WikiTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wikiArticles.map((article, i) => (
          <motion.div key={article.id} custom={i} variants={fadeInUp}>
            <Card
              className={cn(
                "h-full cursor-pointer hover:shadow-md transition-all duration-300",
                expandedId === article.id && "ring-2 ring-primary"
              )}
              onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {article.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3" />
                      阅读约{article.readTime}分钟
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
              </CardContent>
            </Card>

            {/* 展开的文章详情 */}
            <AnimatePresence>
              {expandedId === article.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="mt-2 border-primary/30">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed">
                        {article.content}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== Tab4: 举办城市与场馆 ====================

function VenuesTab() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      <DataNotice />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {venues.map((venue, i) => (
          <motion.div key={venue.id} custom={i} variants={fadeInUp}>
            <Card className="h-full hover:shadow-md transition-shadow duration-300 group">
              <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 via-primary/5 to-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-20">🏟️</div>
                </div>
                <div className="absolute top-3 right-3">
                  <FlagImage code={getCountryFlag(venue.country)} alt={venue.country} size="md" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-white font-bold text-lg">{venue.city}</h3>
                  <p className="text-white/80 text-sm">{venue.country}</p>
                </div>
              </div>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">{venue.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{venue.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{formatNumber(venue.capacity)} 座位</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>{venue.matches} 场比赛</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function getCountryFlag(country: string): string {
  const map: Record<string, string> = {
    "墨西哥": "mx",
    "美国": "us",
    "加拿大": "ca",
  }
  return map[country] || "un"
}

// ==================== 主组件 ====================

export default function Guide() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* 页面标题 */}
      <motion.div variants={fadeInUp} custom={0}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">观赛指南</h1>
        <p className="text-muted-foreground mt-1">2026世界杯赛程、直播渠道、百科知识与举办城市信息</p>
      </motion.div>

      <Tabs defaultTab="schedule" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="w-full md:w-auto inline-flex">
            <TabsTrigger value="schedule" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">赛程日历</span>
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="gap-1.5">
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">直播渠道</span>
            </TabsTrigger>
            <TabsTrigger value="wiki" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">世界杯百科</span>
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">举办城市</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="schedule">
          <ScheduleCalendar />
        </TabsContent>
        <TabsContent value="broadcast">
          <BroadcastTab />
        </TabsContent>
        <TabsContent value="wiki">
          <WikiTab />
        </TabsContent>
        <TabsContent value="venues">
          <VenuesTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
