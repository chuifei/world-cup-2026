import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Newspaper, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/shared/EmptyState"
import { news } from "@/data"

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()

  const item = useMemo(() => {
    return news.find((n) => n.id === id)
  }, [id])

  if (!item) {
    return (
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-12">
              <EmptyState message="未找到该新闻" icon="search" />
              <div className="flex justify-center mt-4">
                <Link to="/">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    返回首页
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const categoryVariantMap: Record<string, "info" | "success" | "warning" | "default"> = {
    "赛事": "info",
    "球员": "success",
    "球队": "warning",
    "花絮": "default",
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </motion.div>

        {/* 新闻详情 */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* 标题区域 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={categoryVariantMap[item.category] ?? "default"}
                  >
                    {item.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.date}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold leading-tight">
                  {item.title}
                </h1>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-border" />

              {/* 正文 */}
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.summary}
              </div>

              {/* 底部分隔 */}
              <div className="border-t border-border pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Newspaper className="h-3.5 w-3.5" />
                <span>2026世界杯新闻中心</span>
              </div>
            </CardContent>
          </Card>
        </motion.article>
      </div>
    </main>
  )
}
