import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import Layout from "@/components/layout/Layout"
import { Skeleton } from "@/components/ui/Skeleton"

const Home = lazy(() => import("@/pages/Home"))
const Matches = lazy(() => import("@/pages/Matches"))
const Prediction = lazy(() => import("@/pages/Prediction"))
const Teams = lazy(() => import("@/pages/Teams"))
const TeamDetail = lazy(() => import("@/pages/TeamDetail"))
const Players = lazy(() => import("@/pages/Players"))
const PlayerDetail = lazy(() => import("@/pages/PlayerDetail"))
const Guide = lazy(() => import("@/pages/Guide"))
const History = lazy(() => import("@/pages/History"))
const NewsDetail = lazy(() => import("@/pages/NewsDetail"))
const NotFound = lazy(() => import("@/pages/NotFound"))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
