import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FlagImage } from "./FlagImage"
import type { Team } from "@/types"
import { CONFEDERATIONS } from "@/constants"

interface TeamCardProps { team: Team }

export function TeamCard({ team }: TeamCardProps) {
  const conf = CONFEDERATIONS[team.confederation]
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/teams/${team.id}`}
        className="block rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
      >
        <div className="h-2" style={{ backgroundColor: conf.color }} />
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <FlagImage code={team.flagCode} alt={team.name} size="lg" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{team.name}</h3>
              <p className="text-xs text-muted-foreground">{team.nameEn}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>FIFA #{team.fifaRank}</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{conf.name}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
