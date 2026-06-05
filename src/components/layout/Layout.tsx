import { type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { MobileNav } from "./MobileNav"
import { ScrollToTop } from "./ScrollToTop"
import { DataNotice } from "@/components/shared/DataNotice"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        {!isHome && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <DataNotice />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileNav />
      <ScrollToTop />
    </div>
  )
}
