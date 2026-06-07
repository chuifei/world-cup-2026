import { z } from 'zod'

export interface Standing {
  rank: number
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  recentForm: ('W' | 'D' | 'L')[]
}

export interface GroupStandings {
  group: string
  standings: Standing[]
  dataStatus: 'pending' | 'live' | 'final'
}

export const GroupParamsSchema = z.object({
  group: z.string().min(1),
})
