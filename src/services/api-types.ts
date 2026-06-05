// football-data.org v4 API 响应类型

export interface ApiArea {
  id: number
  name: string
  code: string
  flag: string | null
}

export interface ApiCompetition {
  id: number
  name: string
  code: string
  type: string
  emblem: string | null
}

export interface ApiSeason {
  id: number
  startDate: string
  endDate: string
  currentMatchday: number
  winner: ApiTeam | null
}

export interface ApiCoach {
  id: number
  firstName: string
  lastName: string
  name: string
  dateOfBirth: string
  nationality: string
}

export interface ApiPlayer {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  position: string
  shirtNumber: number | null
}

export interface ApiTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address: string
  website: string
  founded: number
  clubColors: string
  venue: string
  coach: ApiCoach
  area: ApiArea
  squad?: ApiPlayer[]
}

export interface ApiTeamsResponse {
  count: number
  filters: { season: string }
  competition: ApiCompetition
  season: ApiSeason
  teams: ApiTeam[]
}

export interface ApiScore {
  winner: string | null
  duration: string
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

export interface ApiMatchTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

export interface ApiMatchReferee {
  id: number
  name: string
  type: string
  nationality: string
}

export interface ApiMatch {
  id: number
  utcDate: string
  status: string
  matchday: number
  stage: string
  group: string | null
  lastUpdated: string
  homeTeam: ApiMatchTeam
  awayTeam: ApiMatchTeam
  score: ApiScore
  referees: ApiMatchReferee[]
}

export interface ApiMatchesResponse {
  filters: {
    dateFrom: string
    dateTo: string
    permission?: string
  }
  resultSet: {
    count: number
    competitions: string
    first: string
    last: string
    played: number
  }
  competition: ApiCompetition
  matches: ApiMatch[]
}

export interface ApiStandingTableEntry {
  position: number
  team: ApiMatchTeam
  playedGames: number
  form: string | null
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface ApiStandingGroup {
  stage: string
  type: string
  group: string | null
  table: ApiStandingTableEntry[]
}

export interface ApiStandingsResponse {
  filters: { season: string }
  area: ApiArea
  competition: ApiCompetition
  season: ApiSeason
  standings: ApiStandingGroup[]
}
