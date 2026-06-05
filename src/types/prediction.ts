// ============================================
// 比赛级预测（对阵确定后使用）
// ============================================

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
  result: "W" | "D" | "L"
  date: string
}

export interface HeadToHeadRecord {
  date: string
  tournament: string
  score: string
  result: "W" | "D" | "L"
}

// ============================================
// 球队级夺冠预测（抽签前使用）
// ============================================

export interface TeamPrediction {
  /** 球队标识（对应 teams 数据中的 id） */
  teamId: string
  /** 球队中文名 */
  teamName: string
  /** 夺冠概率（百分比，0-100） */
  winProbability: number
  /** 夺冠关键因素分析 */
  keyFactors: string[]
  /** 数据状态 */
  dataStatus: 'simulated'
}
