import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"
import { FlagImage } from "./FlagImage"
import { formatCurrency } from "@/lib/utils"
import type { Player } from "@/types"

interface PlayerCardProps {
  player: Player
  teamName: string
  teamFlagCode: string
}

export function PlayerCard({ player, teamName, teamFlagCode }: PlayerCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }} className="group">
      <Link
        to={`/players/${player.id}`}
        className="block rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {player.number}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{player.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <FlagImage code={teamFlagCode} alt={teamName} size="sm" />
                <span className="truncate">{teamName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />{player.position}
            </span>
            <span className="text-primary font-medium">{formatCurrency(player.marketValue)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
