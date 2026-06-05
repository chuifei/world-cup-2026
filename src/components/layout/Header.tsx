import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Trophy, Search } from "lucide-react"
import { SearchInput } from "@/components/shared/SearchInput"

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/matches", label: "赛事" },
  { path: "/prediction", label: "AI预测" },
  { path: "/teams", label: "球队" },
  { path: "/guide", label: "观赛指南" },
  { path: "/history", label: "历史长廊" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Trophy className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg hidden sm:block">
            <span className="text-primary">2026</span> World Cup
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop Search */}
          <div className="hidden md:block w-48 xl:w-56">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索..."
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="搜索"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="菜单"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索球队、球员..."
          />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1 animate-in slide-in-from-top">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
