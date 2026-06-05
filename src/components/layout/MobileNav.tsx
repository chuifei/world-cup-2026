import { Link, useLocation } from "react-router-dom"
import { Home, Calendar, Brain, Users, BookOpen, Compass } from "lucide-react"

const MOBILE_NAV = [
  { path: "/", label: "首页", icon: Home },
  { path: "/matches", label: "赛事", icon: Calendar },
  { path: "/prediction", label: "预测", icon: Brain },
  { path: "/teams", label: "球队", icon: Users },
  { path: "/guide", label: "指南", icon: Compass },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 min-w-0 px-2 py-1 text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
