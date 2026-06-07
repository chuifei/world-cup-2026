import { z } from 'zod'

export type MatchStatus = 'pending' | 'live' | 'finished'

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  player: string
  team: 'home' | 'away'
  detail?: string
}

export interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  yellowCards: [number, number]
  redCards: [number, number]
  fouls: [number, number]
}

export interface Lineup {
  home: string[]
  away: string[]
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
  status: MatchStatus
  date: string
  venue: string
  city: string
  group: string
  round: '小组赛' | '32强' | '16强' | '8强' | '4强' | '季军赛' | '决赛'
  events?: MatchEvent[]
  stats?: MatchStats
  lineups?: Lineup
  halfTimeScore?: [number | null, number | null]
}

export interface MatchGroup {
  date: string
  matches: Match[]
}

export const MatchQuerySchema = z.object({
  status: z.enum(['pending', 'live', 'finished']).optional(),
  round: z.enum(['小组赛', '32强', '16强', '8强', '4强', '季军赛', '决赛']).optional(),
  date: z.string().datetime().optional(),
})

export const MatchParamsSchema = z.object({
  id: z.string().min(1),
})
