import { z } from 'zod'

export interface Player {
  id: string
  name: string
  number: number
  position: string
  club: string
  clubLogo?: string
  age: number
  height: number
  weight: number
  nationality: string
  flagCode: string
  preferredFoot: '左' | '右' | '双'
  marketValue: number
  photoUrl?: string
  birthDate?: string
  abilities: {
    shooting: number
    passing: number
    dribbling: number
    speed: number
    defense: number
    physical: number
  }
  tournamentStats: {
    appearances: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    minutesPlayed: number
    averageRating: number
  }
  careerSummary: {
    firstAppearance: string
    totalCaps: number
    totalGoals: number
    majorTournaments: string[]
    clubs: ClubHistory[]
  }
}

export interface ClubHistory {
  clubName: string
  period: string
  appearances: number
  goals: number
}

export interface Coach {
  name: string
  nationality: string
  age: number
  since: string
  trophyCount?: number
}

export interface Team {
  id: string
  name: string
  nameEn: string
  flagCode: string
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC'
  fifaRank: number
  group: string
  coach: Coach
  worldCupAppearances: number
  bestResult: string
  players: Player[]
  tournamentStats: {
    points: number
    goalsFor: number
    goalsAgainst: number
    averagePossession: number
    matchesPlayed: number
    wins: number
    draws: number
    losses: number
  }
  formation: string
  historyResults: WorldCupHistory[]
  dataStatus: 'real' | 'pending'
  qualificationStatus: 'qualified' | 'in_progress' | 'pending'
}

export interface WorldCupHistory {
  year: number
  result: string
  host: string
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

export const TeamQuerySchema = z.object({
  group: z.string().optional(),
  confederation: z.enum(['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'CAF', 'OFC']).optional(),
})

export const TeamParamsSchema = z.object({
  id: z.string().min(1),
})
