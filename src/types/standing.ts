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
  recentForm: ("W" | "D" | "L")[]
}

export interface GroupStandings {
  group: string
  standings: Standing[]
  dataStatus: 'pending' | 'live' | 'final'
}
