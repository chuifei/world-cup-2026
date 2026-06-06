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
  preferredFoot: "左" | "右" | "双"
  marketValue: number
  photoUrl?: string
  birthDate?: string
  // 能力值 (0-99)
  abilities: {
    shooting: number
    passing: number
    dribbling: number
    speed: number
    defense: number
    physical: number
  }
  // 本届赛事统计
  tournamentStats: {
    appearances: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    minutesPlayed: number
    averageRating: number
  }
  // 职业生涯汇总
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
  confederation: "UEFA" | "CONMEBOL" | "CONCACAF" | "AFC" | "CAF" | "OFC"
  fifaRank: number
  group: string
  coach: Coach
  worldCupAppearances: number
  bestResult: string
  players: Player[]
  // 本届赛事统计
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
  // 常用阵型
  formation: string
  // 历史成绩
  historyResults: WorldCupHistory[]
  // 数据状态: real=真实数据, pending=待确认
  dataStatus: 'real' | 'pending'
  // 晋级状态: qualified=已晋级, in_progress=预选赛进行中, pending=待定
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
