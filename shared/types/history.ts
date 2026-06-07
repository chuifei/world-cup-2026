export interface Tournament {
  year: number
  host: string
  hostFlagCode: string
  champion: string
  championFlagCode: string
  runnerUp: string
  runnerUpFlagCode: string
  thirdPlace: string
  thirdPlaceFlagCode: string
  fourthPlace: string
  fourthPlaceFlagCode: string
  topScorer: string
  topScorerGoals: number
  bestPlayer: string
  bestPlayerNote?: string
  bestGoalkeeper: string
  bestGoalkeeperNote?: string
  totalGoals: number
  totalMatches: number
  totalAttendance: number
  teamsCount: number
}

export interface WorldCupRecord {
  id: string
  title: string
  description: string
  detail: string
  category: 'team' | 'player' | 'match' | 'tournament'
}

export interface CountryHistory {
  countryName: string
  flagCode: string
  appearances: number
  titles: number
  totalMatches: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  bestResult: string
}
