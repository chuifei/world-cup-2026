import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Swords, Star, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 装饰圆环 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-yellow-500/10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-yellow-500/5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-yellow-500/[0.03]" />

        {/* 网格线装饰 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* 足球大图标 */}
        <motion.div
          initial={{ rotate: -30, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
          className="relative mx-auto w-32 h-32 md:w-40 md:h-40"
        >
          {/* 外圈旋转 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 border-dashed" />
          </motion.div>

          {/* 内圈反向旋转 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border border-yellow-500/20"
          />

          {/* 中心图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* 多边形足球背景 */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                <Trophy className="h-10 w-10 md:h-12 md:w-12 text-yellow-500" />
              </div>
              {/* 飞出的小星星 */}
              <motion.div
                animate={{ y: [-20, 20], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -top-4 -right-2"
              >
                <Star className="h-5 w-5 text-yellow-500/60" />
              </motion.div>
              <motion.div
                animate={{ y: [10, -15], opacity: [1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
                className="absolute -bottom-2 -left-4"
              >
                <Swords className="h-4 w-4 text-yellow-500/40" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 404 数字 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1
            className="text-8xl md:text-9xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #d97706 60%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>
        </motion.div>

        {/* 趣味文案 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-3"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            哎呀！这个球飞出界了！
          </h2>
          <p className="text-muted-foreground">
            你访问的页面不存在，可能已被删除或地址输入错误。
          </p>
          <p className="text-sm text-muted-foreground/70">
            就像一脚射门偏出了球门 — 但这没关系，让我们回到场上继续比赛！
          </p>
        </motion.div>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/">
            <Button size="lg" className="gap-2 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回首页
            </Button>
          </Link>
          <Link to="/matches">
            <Button size="lg" variant="outline" className="gap-2">
              <Swords className="h-4 w-4" />
              浏览赛事
            </Button>
          </Link>
        </motion.div>

        {/* 底部小提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-xs text-muted-foreground/50 pt-8"
        >
          如果你认为这是一个错误，请联系网站管理员
        </motion.p>
      </div>
    </div>
  )
}
