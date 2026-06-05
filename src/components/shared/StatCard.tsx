import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: string
}

export function StatCard({ label, value, suffix = "", icon }: StatCardProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 1500
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors duration-300"
    >
      <span className="text-3xl mb-3">{icon}</span>
      <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </motion.div>
  )
}
