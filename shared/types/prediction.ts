import { z } from 'zod'

export interface TeamRating {
  recentForm: number
  attack: number
  defense: number
  marketValue: number
  historicalMatchup: number
  tournamentPerformance: number
}

export interface Prediction {
  matchId: string
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  mostLikelyScore: string
  mostLikelyScoreProb: number
  secondLikelyScore: string
  secondLikelyScoreProb: number
  homeRating: TeamRating
  awayRating: TeamRating
  keyFactors: string[]
  homeRecentForm: RecentMatch[]
  awayRecentForm: RecentMatch[]
  headToHead: HeadToHeadRecord[]
}

export interface RecentMatch {
  opponent: string
  score: string
  result: 'W' | 'D' | 'L'
  date: string
}

export interface HeadToHeadRecord {
  date: string
  tournament: string
  score: string
  result: 'W' | 'D' | 'L'
}

export interface TeamPrediction {
  teamId: string
  teamName: string
  winProbability: number
  keyFactors: string[]
  dataStatus: 'simulated'
}

export const UserPredictionBodySchema = z.object({
  matchId: z.string().min(1),
  predictedHomeScore: z.number().int().min(0),
  predictedAwayScore: z.number().int().min(0),
  predictedResult: z.enum(['home_win', 'draw', 'away_win']),
  confidence: z.number().int().min(1).max(5),
})

export type UserPredictionBody = z.infer<typeof UserPredictionBodySchema>

export interface UserPredictionRecord {
  id: number
  userId: number
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  predictedResult: 'home_win' | 'draw' | 'away_win'
  confidence: number
  isCorrect: boolean | null
  pointsEarned: number | null
  createdAt: string
  settledAt: string | null
}

export interface UserStats {
  total: number
  correct: number
  winRate: number
  totalPoints: number
}
