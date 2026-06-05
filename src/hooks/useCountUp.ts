import { useState, useEffect, useRef } from "react"

export function useCountUp(end: number, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const counted = useRef(false)

  useEffect(() => {
    if (!startOnView) {
      animateCount()
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          animateCount()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, startOnView])

  function animateCount() {
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  return { count, ref }
}
