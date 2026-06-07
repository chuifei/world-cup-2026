# 世界杯 2026 网站：前端转全栈实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将纯前端的世界杯网站改造为 Express + SQLite 全栈项目，实现数据持久化、用户识别和实时比分。

**Architecture:** Monorepo 结构，React 前端通过 Vite proxy 调用 Express 后端 API，后端使用 SQLite 存储数据并通过 football-data.org 获取实时比分。`shared/types/` 目录存放前后端共享的 Zod Schema 和 TypeScript 类型。

**Tech Stack:** Express 4.x, better-sqlite3, Zod, jsonwebtoken, tsx, React 18, Vite 5, TypeScript 5

---

### 文件结构总览

```
世界杯网站/
├── shared/                     # 新增 - 共享类型
│   └── types/
│       ├── index.ts
│       ├── team.ts             # Team, Player Zod schema
│       ├── match.ts            # Match Zod schema
│       ├── standing.ts
│       ├── prediction.ts
│       ├── venue.ts
│       ├── history.ts
│       ├── user.ts             # 新增 - 用户类型
│       └── api.ts              # 新增 - API 请求/响应类型
├── server/                     # 新增 - 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts            # Express 入口
│       ├── db/
│       │   ├── connection.ts   # better-sqlite3 连接
│       │   ├── schema.ts       # 建表 SQL
│       │   └── seed.ts         # 从 data/*.ts 导入初始数据
│       ├── middleware/
│       │   ├── auth.ts         # JWT 可选认证
│       │   ├── safeAuth.ts     # JWT 必需认证（用户预测等）
│       │   ├── errorHandler.ts
│       │   └── rateLimit.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── teams.ts
│       │   ├── matches.ts
│       │   ├── standings.ts
│       │   ├── venues.ts
│       │   ├── history.ts
│       │   ├── predictions.ts
│       │   └── userPredictions.ts
│       ├── services/
│       │   ├── footballData.ts # 代理 football-data.org
│       │   └── settlement.ts  # 预测结算
│       └── validators/
│           └── index.ts        # Zod 中间件工厂
├── src/                        # 前端（修改）
│   ├── services/
│   │   ├── api.ts              # 删除
│   │   ├── api-types.ts        # 删除
│   │   └── client.ts           # 新增 - 后端 API 客户端
│   ├── data/                   # 删除
│   ├── hooks/
│   │   └── useAuth.ts          # 新增 - 用户认证 hook
│   ├── components/
│   │   └── shared/
│   │       └── LoginPrompt.tsx # 新增 - 用户名输入弹窗
│   └── pages/
│       └── Prediction.tsx      # 增强
├── vite.config.ts              # 修改 - 添加 proxy
└── package.json                # 修改 - 添加根 scripts
```

---

### Task 1: 项目脚手架 - 创建共享类型目录和后端目录

**Files:**
- Create: `shared/types/team.ts`
- Create: `shared/types/match.ts`
- Create: `shared/types/standing.ts`
- Create: `shared/types/prediction.ts`
- Create: `shared/types/venue.ts`
- Create: `shared/types/history.ts`
- Create: `shared/types/user.ts`
- Create: `shared/types/api.ts`
- Create: `shared/types/index.ts`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`
- Modify: `src/types/team.ts` (re-export from shared)
- Modify: `src/types/match.ts`
- Modify: `src/types/standing.ts`
- Modify: `src/types/prediction.ts`
- Modify: `src/types/venue.ts`
- Modify: `src/types/history.ts`
- Modify: `src/types/index.ts`
- Modify: `tsconfig.app.json` (add path alias for shared)
- Modify: `package.json` (root scripts)

- [ ] **Step 1: 创建 `shared/types/` 目录结构**

```powershell
New-Item -ItemType Directory -Path "shared\types" -Force
```

- [ ] **Step 2: 创建 `shared/types/user.ts`**

```typescript
import { z } from 'zod'

export interface User {
  id: number
  username: string
  created_at: string
}

export const LoginRequestSchema = z.object({
  username: z.string().min(1).max(30),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export interface LoginResponse {
  token: string
  user: User
}
```

- [ ] **Step 3: 创建 `shared/types/api.ts`** — API 通用响应类型

```typescript
export interface ApiError {
  error: string
  details?: unknown
}

export interface PaginationParams {
  offset?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}
```

- [ ] **Step 4: 创建 `shared/types/team.ts`** — 从 `src/types/team.ts` 复制 TS 接口并添加 Zod schema

```typescript
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

// Zod schemas for API validation
export const TeamQuerySchema = z.object({
  group: z.string().optional(),
  confederation: z.string().optional(),
})

export const TeamParamsSchema = z.object({
  id: z.string().min(1),
})
```

- [ ] **Step 5: 创建 `shared/types/match.ts`** — 从 `src/types/match.ts` 复制并添加 Zod schema

```typescript
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
  status: z.string().optional(),
  round: z.string().optional(),
  date: z.string().optional(),
})

export const MatchParamsSchema = z.object({
  id: z.string().min(1),
})
```

- [ ] **Step 6: 创建 `shared/types/standing.ts`**

```typescript
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
```

- [ ] **Step 7: 创建 `shared/types/prediction.ts`**

```typescript
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
```

- [ ] **Step 8: 创建 `shared/types/venue.ts`**

```typescript
import { z } from 'zod'

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  capacity: number
  imageUrl?: string
  matches: number
  description: string
}

export const VenueParamsSchema = z.object({
  id: z.string().min(1),
})
```

- [ ] **Step 9: 创建 `shared/types/history.ts`**

```typescript
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
```

- [ ] **Step 10: 创建 `shared/types/index.ts`**

```typescript
export * from './team'
export * from './match'
export * from './standing'
export * from './prediction'
export * from './venue'
export * from './history'
export * from './user'
export * from './api'
```

- [ ] **Step 11: 更新 `src/types/team.ts`** — 改为从 shared 重导出

```typescript
export type {
  Player,
  ClubHistory,
  Coach,
  Team,
  WorldCupHistory,
} from '@shared/types/team'
```

- [ ] **Step 12: 更新 `src/types/match.ts`**

```typescript
export type {
  MatchStatus,
  MatchEvent,
  MatchStats,
  Lineup,
  Match,
  MatchGroup,
} from '@shared/types/match'
```

- [ ] **Step 13: 更新 `src/types/standing.ts`**

```typescript
export type {
  Standing,
  GroupStandings,
} from '@shared/types/standing'
```

- [ ] **Step 14: 更新 `src/types/prediction.ts`**

```typescript
export type {
  TeamRating,
  Prediction,
  RecentMatch,
  HeadToHeadRecord,
  TeamPrediction,
} from '@shared/types/prediction'
```

- [ ] **Step 15: 更新 `src/types/venue.ts`**

```typescript
export type { Venue } from '@shared/types/venue'
```

- [ ] **Step 16: 更新 `src/types/history.ts`**

```typescript
export type {
  Tournament,
  WorldCupRecord,
  CountryHistory,
} from '@shared/types/history'
```

- [ ] **Step 17: 更新 `tsconfig.app.json`** — 添加 `@shared` 路径别名

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

Read the current tsconfig.app.json first, then edit to add the `@shared/*` entry alongside `@/*`.

- [ ] **Step 18: 创建 `server/package.json`**

```json
{
  "name": "world-cup-2026-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "tsx src/db/seed.ts"
  },
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "express-rate-limit": "^7.4.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 19: 创建 `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "..",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src/**/*.ts", "../shared/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 20: 创建 `server/.env.example`**

```
PORT=3001
JWT_SECRET=change-me-to-random-string
FOOTBALL_DATA_API_KEY=your-api-key-here
WORLD_CUP_ID_2026=
CORS_ORIGIN=http://localhost:5173
```

- [ ] **Step 21: 更新根 `package.json`** — 添加 workspace 脚本

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run dev:server\"",
    "dev:server": "cd server && npm run dev",
    "build": "tsc -b && vite build",
    "build:server": "cd server && npm run build",
    "lint": "eslint .",
    "preview": "vite preview",
    "seed": "cd server && npm run seed"
  }
}
```

Use the `edit` tool to add `dev:server`, `build:server`, and `seed` scripts (keep existing scripts, modify `dev` to use concurrently if not already).

- [ ] **Step 22: 安装依赖**

```powershell
cd server; if ($?) { npm install }
```

Expected: npm install completes successfully.

- [ ] **Step 23: 验证 TypeScript 编译**

```powershell
npx tsc --noEmit -p server/tsconfig.json 2>&1
```

Expected: No errors (may have some about module resolution before we create all files - acceptable at this stage).

---

### Task 2: 数据库 - schema 与连接

**Files:**
- Create: `server/src/db/connection.ts`
- Create: `server/src/db/schema.ts`

- [ ] **Step 1: 创建 `server/src/db/connection.ts`**

```typescript
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'data.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
  }
}
```

- [ ] **Step 2: 创建 `server/src/db/schema.ts`**

```typescript
import { getDb } from './connection'

export function createTables(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      flag_code TEXT,
      confederation TEXT,
      fifa_rank INTEGER,
      group_name TEXT,
      coach_name TEXT,
      coach_nationality TEXT,
      coach_age INTEGER,
      coach_since TEXT,
      formation TEXT,
      data_status TEXT DEFAULT 'pending',
      qualification_status TEXT DEFAULT 'pending',
      world_cup_appearances INTEGER,
      best_result TEXT
    );

    CREATE TABLE IF NOT EXISTS team_tournament_stats (
      team_id TEXT PRIMARY KEY REFERENCES teams(id),
      points INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      average_possession REAL DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT REFERENCES teams(id),
      name TEXT NOT NULL,
      number INTEGER,
      position TEXT,
      club TEXT,
      club_logo TEXT,
      age INTEGER,
      height INTEGER,
      weight INTEGER,
      nationality TEXT,
      flag_code TEXT,
      preferred_foot TEXT,
      market_value INTEGER,
      photo_url TEXT,
      birth_date TEXT,
      abilities TEXT,
      tournament_stats TEXT
    );

    CREATE TABLE IF NOT EXISTS club_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT REFERENCES players(id),
      club_name TEXT NOT NULL,
      period TEXT,
      appearances INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS player_career_summary (
      player_id TEXT PRIMARY KEY REFERENCES players(id),
      first_appearance TEXT,
      total_caps INTEGER DEFAULT 0,
      total_goals INTEGER DEFAULT 0,
      major_tournaments TEXT
    );

    CREATE TABLE IF NOT EXISTS world_cup_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT REFERENCES teams(id),
      year INTEGER NOT NULL,
      result TEXT,
      host TEXT,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      home_team_id TEXT REFERENCES teams(id),
      away_team_id TEXT REFERENCES teams(id),
      home_score INTEGER,
      away_score INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      date TEXT NOT NULL,
      venue_id TEXT,
      city TEXT,
      group_name TEXT,
      round TEXT,
      half_time_home_score INTEGER,
      half_time_away_score INTEGER,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS match_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT REFERENCES matches(id),
      minute INTEGER NOT NULL,
      type TEXT NOT NULL,
      player_name TEXT NOT NULL,
      team TEXT NOT NULL,
      detail TEXT
    );

    CREATE TABLE IF NOT EXISTS match_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT UNIQUE REFERENCES matches(id),
      possession_home INTEGER,
      possession_away INTEGER,
      shots_home INTEGER,
      shots_away INTEGER,
      shots_on_target_home INTEGER,
      shots_on_target_away INTEGER,
      corners_home INTEGER,
      corners_away INTEGER,
      yellows_home INTEGER,
      yellows_away INTEGER,
      reds_home INTEGER,
      reds_away INTEGER,
      fouls_home INTEGER,
      fouls_away INTEGER
    );

    CREATE TABLE IF NOT EXISTS lineups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT REFERENCES matches(id),
      team TEXT NOT NULL,
      player_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      team_id TEXT REFERENCES teams(id),
      rank INTEGER NOT NULL,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      goal_difference INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      recent_form TEXT,
      data_status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      country TEXT,
      capacity INTEGER,
      image_url TEXT,
      matches_count INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      host TEXT,
      host_flag_code TEXT,
      champion TEXT,
      champion_flag_code TEXT,
      runner_up TEXT,
      runner_up_flag_code TEXT,
      third_place TEXT,
      third_place_flag_code TEXT,
      fourth_place TEXT,
      fourth_place_flag_code TEXT,
      top_scorer TEXT,
      top_scorer_goals INTEGER,
      best_player TEXT,
      best_player_note TEXT,
      best_goalkeeper TEXT,
      best_goalkeeper_note TEXT,
      total_goals INTEGER,
      total_matches INTEGER,
      total_attendance INTEGER,
      teams_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS world_cup_records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      detail TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS country_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_name TEXT NOT NULL,
      flag_code TEXT,
      appearances INTEGER DEFAULT 0,
      titles INTEGER DEFAULT 0,
      total_matches INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      best_result TEXT
    );

    CREATE TABLE IF NOT EXISTS head_to_head (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_a_id TEXT REFERENCES teams(id),
      team_b_id TEXT REFERENCES teams(id),
      date TEXT NOT NULL,
      tournament TEXT,
      team_a_score INTEGER,
      team_b_score INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_head_to_head_teams ON head_to_head(team_a_id, team_b_id);

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT UNIQUE REFERENCES matches(id),
      home_win_prob REAL,
      draw_prob REAL,
      away_win_prob REAL,
      most_likely_score TEXT,
      second_likely_score TEXT,
      most_likely_score_prob REAL,
      second_likely_score_prob REAL,
      key_factors TEXT,
      home_rating TEXT,
      away_rating TEXT,
      home_recent_form TEXT,
      away_recent_form TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      match_id TEXT REFERENCES matches(id),
      predicted_home_score INTEGER NOT NULL,
      predicted_away_score INTEGER NOT NULL,
      predicted_result TEXT NOT NULL,
      confidence INTEGER DEFAULT 3,
      is_correct INTEGER,
      points_earned INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      settled_at TEXT,
      UNIQUE(user_id, match_id)
    );
  `)
}
```

- [ ] **Step 3: 验证 schema 创建无报错**

```powershell
cd server; if ($?) { npx tsx -e "import { createTables } from './src/db/schema'; createTables(); console.log('OK')" }
```

Expected: Prints "OK" and creates `server/data.db`.

- [ ] **Step 4: 确认数据库文件已生成**

```powershell
Test-Path -LiteralPath "server/data.db"
```

Expected: `True`

---

### Task 3: 数据库 - Seed 脚本（从静态数据迁移）

**Files:**
- Create: `server/src/db/seed.ts`

- [ ] **Step 1: 创建 `server/src/db/seed.ts`** — 从现有 `src/data/` 导入数据写入 SQLite

由于 Node.js `tsx` 不能直接 import 前端 `src/data/` 的 TypeScript 模块（路径别名不对齐），改为直接在 seed.ts 中硬编码 import 语句，使用相对路径或手动导入逻辑。更实际的做法是：seed 脚本独立读取 JSON 转换后的数据，或直接在脚本中写入关键数据。

```typescript
import { createTables } from './schema'
import { getDb } from './connection'

createTables()

const db = getDb()

// ==========================================
// 插入场地
// ==========================================
const venues = [
  { id: 'azteca', name: '阿兹特克体育场', city: '墨西哥城', country: '墨西哥', capacity: 87523, matches_count: 5, description: '历史悠久的传奇球场，曾举办1970年和1986年世界杯决赛。' },
  { id: 'bbva', name: 'BBVA体育场', city: '蒙特雷', country: '墨西哥', capacity: 53500, matches_count: 4, description: '现代化的足球专用球场，坐落在蒙特雷山脉背景下。' },
  { id: 'akron', name: '阿克伦体育场', city: '瓜达拉哈拉', country: '墨西哥', capacity: 49850, matches_count: 4, description: '墨西哥最具特色的球场之一，拥有独特的建筑风格。' },
  { id: 'metlife', name: '大都会人寿体育场', city: '纽约', country: '美国', capacity: 82500, matches_count: 6, description: '纽约地区的标志性体育场馆，将承办包括决赛在内的重要比赛。' },
  { id: 'sofi', name: 'SoFi体育场', city: '洛杉矶', country: '美国', capacity: 70240, matches_count: 5, description: '世界最先进的体育场之一，拥有巨型双面屏幕。' },
  { id: 'hardrock', name: '硬石体育场', city: '迈阿密', country: '美国', capacity: 65326, matches_count: 5, description: '迈阿密花园的标志性体育场，承办过多届超级碗。' },
  { id: 'att', name: 'AT&T体育场', city: '达拉斯', country: '美国', capacity: 80000, matches_count: 5, description: '拥有可伸缩屋顶的巨型体育场，被誉为美国之队的主场。' },
  { id: 'mercedes', name: '梅赛德斯-奔驰体育场', city: '亚特兰大', country: '美国', capacity: 71000, matches_count: 5, description: '超现代化体育场，拥有独特的可伸缩花瓣式屋顶。' },
  { id: 'nrg', name: 'NRG体育场', city: '休斯顿', country: '美国', capacity: 72220, matches_count: 4, description: '德克萨斯州最大的体育场之一，配备可伸缩屋顶。' },
  { id: 'arrowhead', name: '箭头体育场', city: '堪萨斯城', country: '美国', capacity: 76416, matches_count: 4, description: '以狂热气氛著称的体育场，美国足球文化的重要地标。' },
  { id: 'gillette', name: '吉列体育场', city: '波士顿', country: '美国', capacity: 65878, matches_count: 4, description: '新英格兰地区的顶级体育场馆。' },
  { id: 'lincoln', name: '林肯金融体育场', city: '费城', country: '美国', capacity: 67594, matches_count: 4, description: '费城老鹰队主场，拥有绝佳的城市天际线景观。' },
  { id: 'levis', name: '李维斯体育场', city: '旧金山', country: '美国', capacity: 68500, matches_count: 4, description: '硅谷核心地带的高科技体育场。' },
  { id: 'lumen', name: '流明体育场', city: '西雅图', country: '美国', capacity: 68740, matches_count: 4, description: '西北太平洋地区的标志性体育场，拥有独特的声学设计。' },
  { id: 'bmo', name: 'BMO体育场', city: '多伦多', country: '加拿大', capacity: 45000, matches_count: 4, description: '加拿大最大的足球专用体育场之一。' },
  { id: 'bcplace', name: 'BC广场体育场', city: '温哥华', country: '加拿大', capacity: 54320, matches_count: 4, description: '拥有可伸缩缆绳支撑屋顶的独特建筑，温哥华地标。' },
]

const insertVenue = db.prepare(
  'INSERT OR REPLACE INTO venues (id, name, city, country, capacity, matches_count, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
)

for (const v of venues) {
  insertVenue.run(v.id, v.name, v.city, v.country, v.capacity, v.matches_count, v.description)
}

// ==========================================
// 插入历届世界杯数据
// ==========================================
const tournaments = [
  { year: 1930, host: '乌拉圭', hostFlagCode: 'uy', champion: '乌拉圭', championFlagCode: 'uy', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '美国', thirdPlaceFlagCode: 'us', fourthPlace: '南斯拉夫', fourthPlaceFlagCode: 'rs', topScorer: '斯塔比莱', topScorerGoals: 8, bestPlayer: '纳萨奇', bestGoalkeeper: '巴莱斯特雷罗', totalGoals: 70, totalMatches: 18, totalAttendance: 590549, teamsCount: 13 },
  { year: 1934, host: '意大利', hostFlagCode: 'it', champion: '意大利', championFlagCode: 'it', runnerUp: '捷克斯洛伐克', runnerUpFlagCode: 'cz', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '奥地利', fourthPlaceFlagCode: 'at', topScorer: '内耶德利', topScorerGoals: 5, bestPlayer: '梅阿查', bestGoalkeeper: '普拉尼卡', totalGoals: 70, totalMatches: 17, totalAttendance: 363000, teamsCount: 16 },
  { year: 1938, host: '法国', hostFlagCode: 'fr', champion: '意大利', championFlagCode: 'it', runnerUp: '匈牙利', runnerUpFlagCode: 'hu', thirdPlace: '巴西', thirdPlaceFlagCode: 'br', fourthPlace: '瑞典', fourthPlaceFlagCode: 'se', topScorer: '莱昂尼达斯', topScorerGoals: 7, bestPlayer: '莱昂尼达斯', bestGoalkeeper: '普拉尼卡', totalGoals: 84, totalMatches: 18, totalAttendance: 375700, teamsCount: 15 },
  { year: 1950, host: '巴西', hostFlagCode: 'br', champion: '乌拉圭', championFlagCode: 'uy', runnerUp: '巴西', runnerUpFlagCode: 'br', thirdPlace: '瑞典', thirdPlaceFlagCode: 'se', fourthPlace: '西班牙', fourthPlaceFlagCode: 'es', topScorer: '阿德米尔', topScorerGoals: 9, bestPlayer: '济济尼奥', bestGoalkeeper: '巴博萨', totalGoals: 88, totalMatches: 22, totalAttendance: 1045246, teamsCount: 13 },
  { year: 1954, host: '瑞士', hostFlagCode: 'ch', champion: '西德', championFlagCode: 'de', runnerUp: '匈牙利', runnerUpFlagCode: 'hu', thirdPlace: '奥地利', thirdPlaceFlagCode: 'at', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '柯奇士', topScorerGoals: 11, bestPlayer: '普斯卡什', bestGoalkeeper: '格罗希奇', totalGoals: 140, totalMatches: 26, totalAttendance: 768607, teamsCount: 16 },
  { year: 1958, host: '瑞典', hostFlagCode: 'se', champion: '巴西', championFlagCode: 'br', runnerUp: '瑞典', runnerUpFlagCode: 'se', thirdPlace: '法国', thirdPlaceFlagCode: 'fr', fourthPlace: '西德', fourthPlaceFlagCode: 'de', topScorer: '方丹', topScorerGoals: 13, bestPlayer: '贝利', bestGoalkeeper: '雅辛', totalGoals: 126, totalMatches: 35, totalAttendance: 819810, teamsCount: 16 },
  { year: 1962, host: '智利', hostFlagCode: 'cl', champion: '巴西', championFlagCode: 'br', runnerUp: '捷克斯洛伐克', runnerUpFlagCode: 'cz', thirdPlace: '智利', thirdPlaceFlagCode: 'cl', fourthPlace: '南斯拉夫', fourthPlaceFlagCode: 'rs', topScorer: '加林查', topScorerGoals: 4, bestPlayer: '加林查', bestGoalkeeper: '施罗伊夫', totalGoals: 89, totalMatches: 32, totalAttendance: 893172, teamsCount: 16 },
  { year: 1966, host: '英格兰', hostFlagCode: 'gb', champion: '英格兰', championFlagCode: 'gb', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '葡萄牙', thirdPlaceFlagCode: 'pt', fourthPlace: '苏联', fourthPlaceFlagCode: 'ru', topScorer: '尤西比奥', topScorerGoals: 9, bestPlayer: '查尔顿', bestGoalkeeper: '班克斯', totalGoals: 89, totalMatches: 32, totalAttendance: 1563135, teamsCount: 16 },
  { year: 1970, host: '墨西哥', hostFlagCode: 'mx', champion: '巴西', championFlagCode: 'br', runnerUp: '意大利', runnerUpFlagCode: 'it', thirdPlace: '西德', thirdPlaceFlagCode: 'de', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '盖德·穆勒', topScorerGoals: 10, bestPlayer: '贝利', bestGoalkeeper: '马祖尔凯维奇', totalGoals: 95, totalMatches: 32, totalAttendance: 1603975, teamsCount: 16 },
  { year: 1974, host: '西德', hostFlagCode: 'de', champion: '西德', championFlagCode: 'de', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '波兰', thirdPlaceFlagCode: 'pl', fourthPlace: '巴西', fourthPlaceFlagCode: 'br', topScorer: '拉托', topScorerGoals: 7, bestPlayer: '克鲁伊夫', bestGoalkeeper: '迈耶', totalGoals: 97, totalMatches: 38, totalAttendance: 1774022, teamsCount: 16 },
  { year: 1978, host: '阿根廷', hostFlagCode: 'ar', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '巴西', thirdPlaceFlagCode: 'br', fourthPlace: '意大利', fourthPlaceFlagCode: 'it', topScorer: '肯佩斯', topScorerGoals: 6, bestPlayer: '肯佩斯', bestGoalkeeper: '菲洛尔', totalGoals: 102, totalMatches: 38, totalAttendance: 1545791, teamsCount: 16 },
  { year: 1982, host: '西班牙', hostFlagCode: 'es', champion: '意大利', championFlagCode: 'it', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '波兰', thirdPlaceFlagCode: 'pl', fourthPlace: '法国', fourthPlaceFlagCode: 'fr', topScorer: '罗西', topScorerGoals: 6, bestPlayer: '罗西', bestGoalkeeper: '佐夫', totalGoals: 146, totalMatches: 52, totalAttendance: 2109723, teamsCount: 24 },
  { year: 1986, host: '墨西哥', hostFlagCode: 'mx', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '法国', thirdPlaceFlagCode: 'fr', fourthPlace: '比利时', fourthPlaceFlagCode: 'be', topScorer: '莱因克尔', topScorerGoals: 6, bestPlayer: '马拉多纳', bestGoalkeeper: '舒马赫', totalGoals: 132, totalMatches: 52, totalAttendance: 2394031, teamsCount: 24 },
  { year: 1990, host: '意大利', hostFlagCode: 'it', champion: '西德', championFlagCode: 'de', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '意大利', thirdPlaceFlagCode: 'it', fourthPlace: '英格兰', fourthPlaceFlagCode: 'gb', topScorer: '斯基拉奇', topScorerGoals: 6, bestPlayer: '斯基拉奇', bestGoalkeeper: '戈耶切亚', totalGoals: 115, totalMatches: 52, totalAttendance: 2516215, teamsCount: 24 },
  { year: 1994, host: '美国', hostFlagCode: 'us', champion: '巴西', championFlagCode: 'br', runnerUp: '意大利', runnerUpFlagCode: 'it', thirdPlace: '瑞典', thirdPlaceFlagCode: 'se', fourthPlace: '保加利亚', fourthPlaceFlagCode: 'bg', topScorer: '斯托伊奇科夫', topScorerGoals: 6, bestPlayer: '罗马里奥', bestGoalkeeper: '普雷德霍姆', totalGoals: 141, totalMatches: 52, totalAttendance: 3587538, teamsCount: 24 },
  { year: 1998, host: '法国', hostFlagCode: 'fr', champion: '法国', championFlagCode: 'fr', runnerUp: '巴西', runnerUpFlagCode: 'br', thirdPlace: '克罗地亚', thirdPlaceFlagCode: 'hr', fourthPlace: '荷兰', fourthPlaceFlagCode: 'nl', topScorer: '苏克', topScorerGoals: 6, bestPlayer: '罗纳尔多', bestGoalkeeper: '巴特斯', totalGoals: 171, totalMatches: 64, totalAttendance: 2785100, teamsCount: 32 },
  { year: 2002, host: '韩国/日本', hostFlagCode: 'kr', champion: '巴西', championFlagCode: 'br', runnerUp: '德国', runnerUpFlagCode: 'de', thirdPlace: '土耳其', thirdPlaceFlagCode: 'tr', fourthPlace: '韩国', fourthPlaceFlagCode: 'kr', topScorer: '罗纳尔多', topScorerGoals: 8, bestPlayer: '卡恩', bestGoalkeeper: '卡恩', totalGoals: 161, totalMatches: 64, totalAttendance: 2705197, teamsCount: 32 },
  { year: 2006, host: '德国', hostFlagCode: 'de', champion: '意大利', championFlagCode: 'it', runnerUp: '法国', runnerUpFlagCode: 'fr', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '葡萄牙', fourthPlaceFlagCode: 'pt', topScorer: '克洛泽', topScorerGoals: 5, bestPlayer: '齐达内', bestGoalkeeper: '布冯', totalGoals: 147, totalMatches: 64, totalAttendance: 3359439, teamsCount: 32 },
  { year: 2010, host: '南非', hostFlagCode: 'za', champion: '西班牙', championFlagCode: 'es', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '托马斯·穆勒', topScorerGoals: 5, bestPlayer: '弗兰', bestGoalkeeper: '卡西利亚斯', totalGoals: 145, totalMatches: 64, totalAttendance: 3178856, teamsCount: 32 },
  { year: 2014, host: '巴西', hostFlagCode: 'br', champion: '德国', championFlagCode: 'de', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '荷兰', thirdPlaceFlagCode: 'nl', fourthPlace: '巴西', fourthPlaceFlagCode: 'br', topScorer: 'J罗', topScorerGoals: 6, bestPlayer: '梅西', bestGoalkeeper: '诺伊尔', totalGoals: 171, totalMatches: 64, totalAttendance: 3429873, teamsCount: 32 },
  { year: 2018, host: '俄罗斯', hostFlagCode: 'ru', champion: '法国', championFlagCode: 'fr', runnerUp: '克罗地亚', runnerUpFlagCode: 'hr', thirdPlace: '比利时', thirdPlaceFlagCode: 'be', fourthPlace: '英格兰', fourthPlaceFlagCode: 'gb', topScorer: '凯恩', topScorerGoals: 6, bestPlayer: '莫德里奇', bestGoalkeeper: '库尔图瓦', totalGoals: 169, totalMatches: 64, totalAttendance: 3031768, teamsCount: 32 },
  { year: 2022, host: '卡塔尔', hostFlagCode: 'qa', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '法国', runnerUpFlagCode: 'fr', thirdPlace: '克罗地亚', thirdPlaceFlagCode: 'hr', fourthPlace: '摩洛哥', fourthPlaceFlagCode: 'ma', topScorer: '姆巴佩', topScorerGoals: 8, bestPlayer: '梅西', bestGoalkeeper: '马丁内斯', totalGoals: 172, totalMatches: 64, totalAttendance: 3404252, teamsCount: 32 },
]

const insertTournament = db.prepare(
  `INSERT OR REPLACE INTO tournaments (year, host, host_flag_code, champion, champion_flag_code, runner_up, runner_up_flag_code, third_place, third_place_flag_code, fourth_place, fourth_place_flag_code, top_scorer, top_scorer_goals, best_player, best_goalkeeper, total_goals, total_matches, total_attendance, teams_count)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
)

for (const t of tournaments) {
  insertTournament.run(t.year, t.host, t.hostFlagCode, t.champion, t.championFlagCode, t.runnerUp, t.runnerUpFlagCode, t.thirdPlace, t.thirdPlaceFlagCode, t.fourthPlace, t.fourthPlaceFlagCode, t.topScorer, t.topScorerGoals, t.bestPlayer, t.bestGoalkeeper, t.totalGoals, t.totalMatches, t.totalAttendance, t.teamsCount)
}

// ==========================================
// 插入世界杯纪录
// ==========================================
const records = [
  { id: 'r1', title: '最多冠军', description: '巴西 - 5次夺冠', detail: '巴西在1958、1962、1970、1994、2002年五次夺得世界杯冠军，是世界杯历史上最成功的球队。', category: 'team' },
  { id: 'r2', title: '单届最多进球', description: '1954年瑞士世界杯 - 140球', detail: '1954年瑞士世界杯共打入140球，在26场比赛中场均5.38球。', category: 'tournament' },
  { id: 'r3', title: '最快进球', description: '哈坎·苏克 - 11秒（2002年）', detail: '2002年三四名决赛，土耳其前锋哈坎·苏克在开场仅11秒就攻破韩国队大门。', category: 'player' },
  { id: 'r4', title: '个人最多进球', description: '克洛泽 - 16球', detail: '德国前锋米罗斯拉夫·克洛泽在四届世界杯（2002-2014）中共打入16球。', category: 'player' },
  { id: 'r5', title: '单场最多进球', description: '奥地利7-5瑞士（1954年）', detail: '1954年世界杯四分之一决赛，奥地利7-5战胜瑞士，两队合计贡献12球。', category: 'match' },
]

const insertRecord = db.prepare(
  'INSERT OR REPLACE INTO world_cup_records (id, title, description, detail, category) VALUES (?, ?, ?, ?, ?)'
)
for (const r of records) {
  insertRecord.run(r.id, r.title, r.description, r.detail, r.category)
}

console.log('Seed 完成：场地、历届世界杯、纪录已写入')
```

- [ ] **Step 2: 验证 seed 脚本能运行**

```powershell
cd server; if ($?) { npx tsx src/db/seed.ts }
```

Expected: 输出 "Seed 完成：场地、历届世界杯、纪录已写入"，无错误。

---

### Task 4: 后端中间件

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/safeAuth.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/rateLimit.ts`
- Create: `server/src/validators/index.ts`

- [ ] **Step 1: 创建 `server/src/middleware/auth.ts`** — 可选认证（提取 token 但不拒绝无 token 请求）

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface AuthUser {
  userId: number
  username: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthUser
      req.user = payload
    } catch {
      // token 无效，忽略，继续作为匿名用户
    }
  }
  next()
}
```

- [ ] **Step 2: 创建 `server/src/middleware/safeAuth.ts`** — 必需认证（用于用户预测等）

```typescript
import { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: '请先输入用户名' })
    return
  }
  next()
}
```

- [ ] **Step 3: 创建 `server/src/middleware/errorHandler.ts`**

```typescript
import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message)
  res.status(500).json({ error: '服务器内部错误' })
}
```

- [ ] **Step 4: 创建 `server/src/middleware/rateLimit.ts`**

```typescript
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' },
})
```

- [ ] **Step 5: 创建 `server/src/validators/index.ts`** — Zod 校验中间件工厂

```typescript
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req[source] = schema.parse(req[source])
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: '参数校验失败', details: err.errors })
        return
      }
      next(err)
    }
  }
}
```

---

### Task 5: Express 入口 + 用户认证路由

**Files:**
- Create: `server/src/index.ts`
- Create: `server/src/routes/auth.ts`

- [ ] **Step 1: 创建 `server/src/index.ts`**

```typescript
import express from 'express'
import cors from 'cors'
import { createTables } from './db/schema'
import { optionalAuth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimit'
import authRouter from './routes/auth'
import teamsRouter from './routes/teams'
import matchesRouter from './routes/matches'
import standingsRouter from './routes/standings'
import venuesRouter from './routes/venues'
import historyRouter from './routes/history'
import predictionsRouter from './routes/predictions'
import userPredictionsRouter from './routes/userPredictions'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

createTables()

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(apiLimiter)
app.use(optionalAuth)

app.use('/api/auth', authRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/matches', matchesRouter)
app.use('/api/standings', standingsRouter)
app.use('/api/venues', venuesRouter)
app.use('/api/history', historyRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/user', userPredictionsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 2: 创建 `server/src/routes/auth.ts`**

```typescript
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getDb } from '../db/connection'
import { LoginRequestSchema } from '@shared/types/user'
import { validate } from '../validators'
import { authLimiter } from '../middleware/rateLimit'
import type { User, LoginResponse } from '@shared/types/user'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

router.post('/login', authLimiter, validate(LoginRequestSchema), (req: Request, res: Response): void => {
  const { username } = req.body as { username: string }
  const db = getDb()

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined

  if (!user) {
    const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username)
    user = { id: result.lastInsertRowid as number, username, created_at: new Date().toISOString() }
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })

  const response: LoginResponse = { token, user }
  res.json(response)
})

export default router
```

- [ ] **Step 3: 测试开发服务器启动**

```powershell
cd server; if ($?) { $env:JWT_SECRET = "test-secret"; npx tsx src/index.ts }
# 看到 "Server running on http://localhost:3001" 后 Ctrl+C 停止
```

Expected: 服务器正常启动，无报错。

- [ ] **Step 4: 测试 auth 接口**

```powershell
# 在另一个终端
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"testuser"}'
```

Expected: 返回 `{"token":"...","user":{"id":1,"username":"testuser",...}}`

---

### Task 6: 球队 API 路由 + Seed（球队和球员数据）

**Files:**
- Create: `server/src/routes/teams.ts`
- 实际的球队和球员 seed 数据量巨大（`src/data/teams.ts` 有 61878 行），seed 脚本需逐步追加。先将 `src/data/teams.ts` 的 `teams` 数组转换为 JSON 文件，再在 seed 中 import。

**简化方案：** 在 `server/src/db/seed.ts` 中追加一个 `import { teams } from '../../src/data/teams'` 并遍历插入。由于 `tsx` 支持路径别名但 `src/data/teams.ts` 使用 `../types/team` 相对路径，我们需要先确保 `src/types/` 已经重导出到 `shared/`。

实际上 `src/data/teams.ts` 第一行是 `import type { Team } from '../types/team'`，而 `src/types/team.ts` 现在重导出 `@shared/types/team`。tsx 在执行 seed 时不会设置 `@/` 别名（那是 Vite 的），但 `src/data/teams.ts` 用的是相对路径 (`../types/team`)，相对路径应该能工作。

然而 `src/types/team.ts` 现在又 import from `@shared/types/team`，这 tsx 就无法解析了。

**最终方案：** 在 seed 中直接读取 `../src/data/teams.js` 太复杂。改为在 seed.ts 中创建一个辅助函数，将球队数组 JSON 直接内嵌（抓取少量代表性球队），或采用更实际的做法：用 `fs.readFileSync` 读取 `src/data/teams.ts` 并用正则提取数据，这也不可靠。

**最务实的方案：** Seed 团队数据在 task 后面用一个独立脚本，先用 `npx tsx` 在 Vite 上下文中执行（但 Vite 配置 tsx 不理解）。

**建议方案（务实执行）：** 
1. 球队和球员数据在 `server/src/db/seed.ts` 中用动态 import 方式加载（通过 `createRequire` 或直接 eval）
2. 但由于路径别名问题，改为手动维护一个 `teams.json` 副本

考虑到 `src/data/teams.ts` 有 61878 行，实际的 seed 最佳实践是：
- 先让 `server/src/routes/teams.ts` 从静态数据直接 read（兼容过渡期）
- 后续 task 再处理完整迁移

但在本计划中，我们需要一个可工作的方案。我会在 **Task 12** 中处理这个迁移问题。当前先创建路由框架。

- [ ] **Step 1: 创建 `server/src/routes/teams.ts`** — 数据库优先，空时 fallback 到返回空数组

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'
import type { Team } from '@shared/types/team'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { group, confederation } = req.query
  const db = getDb()

  let sql = 'SELECT * FROM teams WHERE 1=1'
  const params: string[] = []

  if (typeof group === 'string') {
    sql += ' AND group_name = ?'
    params.push(group)
  }
  if (typeof confederation === 'string') {
    sql += ' AND confederation = ?'
    params.push(confederation)
  }

  const teams = db.prepare(sql).all(...params)
  res.json(teams)
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id)

  if (!team) {
    res.status(404).json({ error: '球队不存在' })
    return
  }

  const players = db.prepare('SELECT * FROM players WHERE team_id = ?').all(req.params.id)
  const history = db.prepare('SELECT * FROM world_cup_history WHERE team_id = ? ORDER BY year DESC').all(req.params.id)
  const stats = db.prepare('SELECT * FROM team_tournament_stats WHERE team_id = ?').get(req.params.id)

  res.json({ ...(team as object), players, historyResults: history, tournamentStats: stats || {} })
})

export default router
```

- [ ] **Step 2: 验证路由挂载正确** — 重启服务器并测试

```powershell
curl http://localhost:3001/api/teams
curl http://localhost:3001/api/teams/spain
```

Expected: 返回空数组 `[]`（数据尚未 seed）和 404 `{"error":"球队不存在"}`

---

### Task 7: 比赛 API 路由

**Files:**
- Create: `server/src/routes/matches.ts`

- [ ] **Step 1: 创建 `server/src/routes/matches.ts`**

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'
import { MatchQuerySchema, MatchParamsSchema } from '@shared/types/match'
import { validate } from '../validators'

const router = Router()

// 注意：/live 必须放在 /:id 前面，否则 Express 会把 'live' 当成 :id
router.get('/live', (_req: Request, res: Response): void => {
  const db = getDb()
  const matches = db.prepare(
    'SELECT * FROM matches WHERE status = ? ORDER BY date ASC'
  ).all('live')
  res.json(matches)
})

router.get('/:id/analysis', (req: Request, res: Response): void => {
  const db = getDb()
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined

  if (!match) {
    res.status(404).json({ error: '比赛不存在' })
    return
  }

  const homeTeamId = match.home_team_id as string
  const awayTeamId = match.away_team_id as string

  const homeTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(homeTeamId)
  const awayTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(awayTeamId)

  const headToHead = db.prepare(
    'SELECT * FROM head_to_head WHERE (team_a_id = ? AND team_b_id = ?) OR (team_a_id = ? AND team_b_id = ?) ORDER BY date DESC LIMIT 10'
  ).all(homeTeamId, awayTeamId, awayTeamId, homeTeamId)

  const homeRecent = db.prepare(
    `SELECT * FROM matches WHERE (home_team_id = ? OR away_team_id = ?) AND status = 'finished' ORDER BY date DESC LIMIT 5`
  ).all(homeTeamId, homeTeamId)

  const awayRecent = db.prepare(
    `SELECT * FROM matches WHERE (home_team_id = ? OR away_team_id = ?) AND status = 'finished' ORDER BY date DESC LIMIT 5`
  ).all(awayTeamId, awayTeamId)

  res.json({
    homeTeam,
    awayTeam,
    headToHead,
    homeRecentMatches: homeRecent,
    awayRecentMatches: awayRecent,
  })
})

router.get('/', (req: Request, res: Response): void => {
  const { status, round, date } = req.query
  const db = getDb()
  let sql = 'SELECT * FROM matches WHERE 1=1'
  const params: string[] = []

  if (typeof status === 'string') {
    sql += ' AND status = ?'
    params.push(status)
  }
  if (typeof round === 'string') {
    sql += ' AND round = ?'
    params.push(round)
  }
  if (typeof date === 'string') {
    sql += ' AND date(date) = date(?)'
    params.push(date)
  }

  sql += ' ORDER BY date ASC'
  const matches = db.prepare(sql).all(...params)
  res.json(matches)
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id)

  if (!match) {
    res.status(404).json({ error: '比赛不存在' })
    return
  }

  const events = db.prepare('SELECT * FROM match_events WHERE match_id = ? ORDER BY minute ASC').all(req.params.id)
  const stats = db.prepare('SELECT * FROM match_stats WHERE match_id = ?').get(req.params.id)
  const lineups = db.prepare('SELECT * FROM lineups WHERE match_id = ?').all(req.params.id)

  res.json({ ...(match as object), events, stats, lineups })
})

export default router
```

---

### Task 8: 积分榜 + 场地 + 历史 API 路由

**Files:**
- Create: `server/src/routes/standings.ts`
- Create: `server/src/routes/venues.ts`
- Create: `server/src/routes/history.ts`

- [ ] **Step 1: 创建 `server/src/routes/standings.ts`**

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/:group', (req: Request, res: Response): void => {
  const db = getDb()
  const standings = db.prepare(
    'SELECT * FROM standings WHERE group_name = ? ORDER BY rank ASC'
  ).all(req.params.group)
  res.json(standings)
})

router.get('/', (_req: Request, res: Response): void => {
  const db = getDb()
  const standings = db.prepare(
    'SELECT * FROM standings ORDER BY group_name, rank ASC'
  ).all()
  res.json(standings)
})

export default router
```

- [ ] **Step 2: 创建 `server/src/routes/venues.ts`**

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  const db = getDb()
  const venues = db.prepare('SELECT * FROM venues').all()
  res.json(venues)
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id)
  if (!venue) {
    res.status(404).json({ error: '场地不存在' })
    return
  }
  res.json(venue)
})

export default router
```

- [ ] **Step 3: 创建 `server/src/routes/history.ts`**

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/tournaments', (_req: Request, res: Response): void => {
  const db = getDb()
  const tournaments = db.prepare('SELECT * FROM tournaments ORDER BY year DESC').all()
  res.json(tournaments)
})

router.get('/records', (_req: Request, res: Response): void => {
  const db = getDb()
  const records = db.prepare('SELECT * FROM world_cup_records').all()
  res.json(records)
})

router.get('/countries', (_req: Request, res: Response): void => {
  const db = getDb()
  const countries = db.prepare('SELECT * FROM country_history').all()
  res.json(countries)
})

export default router
```

---

### Task 9: 预测 API 路由

**Files:**
- Create: `server/src/routes/predictions.ts`
- Create: `server/src/routes/userPredictions.ts`
- Create: `server/src/services/settlement.ts`

- [ ] **Step 1: 创建 `server/src/routes/predictions.ts`** — 系统/AI 预测（公开）

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/:matchId', (req: Request, res: Response): void => {
  const db = getDb()
  const prediction = db.prepare('SELECT * FROM predictions WHERE match_id = ?').get(req.params.matchId)
  if (!prediction) {
    res.status(404).json({ error: '暂无该比赛预测' })
    return
  }
  // 解析 JSON 字段
  const p = prediction as Record<string, unknown>
  res.json({
    ...p,
    keyFactors: p.key_factors ? JSON.parse(p.key_factors as string) : [],
    homeRating: p.home_rating ? JSON.parse(p.home_rating as string) : null,
    awayRating: p.away_rating ? JSON.parse(p.away_rating as string) : null,
    homeRecentForm: p.home_recent_form ? JSON.parse(p.home_recent_form as string) : [],
    awayRecentForm: p.away_recent_form ? JSON.parse(p.away_recent_form as string) : [],
  })
})

export default router
```

- [ ] **Step 2: 创建 `server/src/services/settlement.ts`**

```typescript
import { getDb } from '../db/connection'

export function settlePredictions(matchId: string): void {
  const db = getDb()

  const match = db.prepare(
    'SELECT home_score, away_score FROM matches WHERE id = ? AND status = ?'
  ).get(matchId, 'finished') as { home_score: number; away_score: number } | undefined

  if (!match) return

  const homeScore = match.home_score
  const awayScore = match.away_score

  let actualResult: 'home_win' | 'draw' | 'away_win'
  if (homeScore > awayScore) actualResult = 'home_win'
  else if (homeScore < awayScore) actualResult = 'away_win'
  else actualResult = 'draw'

  const predictions = db.prepare(
    'SELECT * FROM user_predictions WHERE match_id = ? AND is_correct IS NULL'
  ).all(matchId) as Array<{
    id: number
    predicted_home_score: number
    predicted_away_score: number
    predicted_result: string
    confidence: number
  }>

  const updateStmt = db.prepare(
    'UPDATE user_predictions SET is_correct = ?, points_earned = ?, settled_at = datetime(\'now\') WHERE id = ?'
  )

  for (const pred of predictions) {
    const resultCorrect = pred.predicted_result === actualResult
    const scoreCorrect = pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore

    let points = 0
    if (scoreCorrect) {
      points = 25 + pred.confidence * 2
    } else if (resultCorrect) {
      points = 10 + pred.confidence * 2
    }

    updateStmt.run(resultCorrect ? 1 : 0, points, pred.id)
  }
}
```

- [ ] **Step 3: 创建 `server/src/routes/userPredictions.ts`** — 用户预测（需认证）

```typescript
import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'
import { UserPredictionBodySchema } from '@shared/types/prediction'
import { requireAuth } from '../middleware/safeAuth'
import { validate } from '../validators'

const router = Router()

router.get('/predictions', requireAuth, (req: Request, res: Response): void => {
  const db = getDb()
  const { matchId, settled } = req.query

  let sql = 'SELECT * FROM user_predictions WHERE user_id = ?'
  const params: (string | number)[] = [req.user!.userId]

  if (typeof matchId === 'string') {
    sql += ' AND match_id = ?'
    params.push(matchId)
  }
  if (settled === 'true') {
    sql += ' AND is_correct IS NOT NULL'
  } else if (settled === 'false') {
    sql += ' AND is_correct IS NULL'
  }

  sql += ' ORDER BY created_at DESC'
  const predictions = db.prepare(sql).all(...params)
  res.json(predictions)
})

router.post('/predictions', requireAuth, validate(UserPredictionBodySchema), (req: Request, res: Response): void => {
  const db = getDb()
  const { matchId, predictedHomeScore, predictedAwayScore, predictedResult, confidence } = req.body as {
    matchId: string
    predictedHomeScore: number
    predictedAwayScore: number
    predictedResult: string
    confidence: number
  }

  // 检查比赛是否已开始（不允许预测已开始的比赛）
  const match = db.prepare('SELECT status FROM matches WHERE id = ?').get(matchId) as { status: string } | undefined
  if (!match) {
    res.status(404).json({ error: '比赛不存在' })
    return
  }
  if (match.status !== 'pending') {
    res.status(400).json({ error: '比赛已开始或已结束，无法预测' })
    return
  }

  // UPSERT：已预测过则更新，否则插入
  const existing = db.prepare('SELECT id FROM user_predictions WHERE user_id = ? AND match_id = ?').get(req.user!.userId, matchId)

  if (existing) {
    db.prepare(
      'UPDATE user_predictions SET predicted_home_score = ?, predicted_away_score = ?, predicted_result = ?, confidence = ? WHERE user_id = ? AND match_id = ?'
    ).run(predictedHomeScore, predictedAwayScore, predictedResult, confidence, req.user!.userId, matchId)
  } else {
    db.prepare(
      'INSERT INTO user_predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_result, confidence) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user!.userId, matchId, predictedHomeScore, predictedAwayScore, predictedResult, confidence)
  }

  res.json({ success: true })
})

router.get('/stats', requireAuth, (req: Request, res: Response): void => {
  const db = getDb()

  const row = db.prepare(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
       COALESCE(SUM(points_earned), 0) as total_points
     FROM user_predictions
     WHERE user_id = ? AND is_correct IS NOT NULL`
  ).get(req.user!.userId) as { total: number; correct: number; total_points: number }

  res.json({
    total: row.total,
    correct: row.correct,
    winRate: row.total > 0 ? Math.round((row.correct / row.total) * 1000) / 10 : 0,
    totalPoints: row.total_points,
  })
})

export default router
```

---

### Task 10: Football-data.org 代理服务

**Files:**
- Create: `server/src/services/footballData.ts`

- [ ] **Step 1: 创建 `server/src/services/footballData.ts`**

```typescript
const API_BASE = 'https://api.football-data.org/v4'

function getApiKey(): string {
  return process.env.FOOTBALL_DATA_API_KEY || ''
}

function getCompetitionId(): string {
  return process.env.WORLD_CUP_ID_2026 || ''
}

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Auth-Token': apiKey,
        'Accept': 'application/json',
      },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function getLiveMatches() {
  const compId = getCompetitionId()
  if (!compId) return null

  return fetchApi<{
    matches: Array<{
      id: number
      utcDate: string
      status: string
      stage: string
      group: string | null
      homeTeam: { id: number; name: string; shortName: string; crest: string }
      awayTeam: { id: number; name: string; shortName: string; crest: string }
      score: {
        winner: string | null
        fullTime: { home: number | null; away: number | null }
        halfTime: { home: number | null; away: number | null }
      }
    }>
  }>(`/competitions/${compId}/matches`, { status: 'LIVE' })
}

export async function getFinishedMatches() {
  const compId = getCompetitionId()
  if (!compId) return null

  return fetchApi<{
    matches: Array<{
      id: number
      status: string
      score: {
        fullTime: { home: number | null; away: number | null }
      }
    }>
  }>(`/competitions/${compId}/matches`, { status: 'FINISHED' })
}
```

---

### Task 11: 实时比分轮询 + 预测结算集成

将实时比分轮询和预测结算集成到 `server/src/index.ts` 中。

- [ ] **Step 1: 在服务器启动时添加定时轮询逻辑** — 修改 `server/src/index.ts`

在 listen 回调中添加：

```typescript
import { getLiveMatches, getFinishedMatches } from './services/footballData'
import { settlePredictions } from './services/settlement'
import { getDb } from './db/connection'

// ... 在 app.listen 回调中添加：

  // 每 60 秒检查一次实时比分 + 结算
  setInterval(async () => {
    const db = getDb()

    // 1. 拉取进行中的比赛
    const liveData = await getLiveMatches()
    if (liveData?.matches) {
      for (const m of liveData.matches) {
        const matchId = `m${m.id}`
        db.prepare(
          `UPDATE matches SET status = 'live', home_score = ?, away_score = ?, half_time_home_score = ?, half_time_away_score = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(
          m.score.fullTime.home,
          m.score.fullTime.away,
          m.score.halfTime.home,
          m.score.halfTime.away,
          matchId
        )
      }
    }

    // 2. 拉取已结束的比赛并触发结算
    const finishedData = await getFinishedMatches()
    if (finishedData?.matches) {
      for (const m of finishedData.matches) {
        const matchId = `m${m.id}`
        const existing = db.prepare('SELECT status FROM matches WHERE id = ?').get(matchId) as { status: string } | undefined
        if (existing && existing.status !== 'finished') {
          db.prepare(
            `UPDATE matches SET status = 'finished', home_score = ?, away_score = ?, updated_at = datetime('now') WHERE id = ?`
          ).run(m.score.fullTime.home, m.score.fullTime.away, matchId)
          settlePredictions(matchId)
        }
      }
    }
  }, 60000)
```

- [ ] **Step 2: 验证 timer 不阻塞启动**

```powershell
cd server; if ($?) { $env:JWT_SECRET = "test-secret"; npx tsx src/index.ts }
```

Expected: 服务器正常启动，60s 后不报错（API Key 未配置时静默跳过）。

---

### Task 12: 完整数据 Seed（球队、球员、比赛、积分榜）

由于 `src/data/teams.ts` (61878行)、`src/data/matches.ts` (1397行) 数据量巨大，且路径别名问题导致 tsx 无法直接 import。采用以下方案：

**Files:**
- Modify: `server/src/db/seed.ts` (追加 import 逻辑)

**方案：** 在 seed.ts 中通过动态读取 + eval 方式加载前端数据文件，或创建一个中间步骤先将 `src/data/` 导出为 JSON。

更实际的做法：在后端项目中使用 Vite 的 SSR 能力或直接写一个小型转译脚本。但为了简单，我们直接在 seed.ts 中使用 `node --loader tsx` 配合相对路径 import。

由于 `src/data/` 文件 import 了 `../types/team`，而 `src/types/team.ts` 现在又 import from `@shared/types/team`（路径别名），tsx 无法解析 `@shared/`。

**解决方案：** 在 `server/tsconfig.json` 中已经配置了 `@shared/*` 路径映射，但 tsx 默认不读取 tsconfig paths。需要使用 `tsconfig-paths` 或 `tsx` 的 `--tsconfig` 选项。

```powershell
cd server; if ($?) { npx tsx --tsconfig tsconfig.json src/db/seed.ts }
```

但是 `src/data/teams.ts` 中的 import 路径是 `../types/team`，这是从 `src/data/` 到 `src/types/` 的路径，在 server 的 tsconfig 中 rootDir 是 `..` 所以相对路径在不同 root 下会出问题。

**最终务实方案：** 创建一个独立的 `scripts/migrate-data.ts` 脚本，用 fs 读取原始 TS 文件，使用正则提取数组，或直接用 `npx vite-node`。

但 `vite-node` 需要额外安装。最简方案：在 seed.ts 中手动内嵌数据（因为我们已经用 `server/src/db/seed.ts` 写入了可手写的数据如 venues、tournaments、records）。对于 teams、players、matches 和 standings 等大数据，我们使用 `import()` 动态导入的变通方式：

在 `server/src/db/seed.ts` 末尾追加：

```typescript
// 尝试加载前端数据（如果路径可解析）
async function loadFrontendData() {
  try {
    // 使用 createRequire 从项目根目录加载
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    
    // 尝试读取编译后的数据；如果不可用则跳过
    console.log('前端数据需手动迁移（球队、球员、比赛、积分榜）。请运行 scripts/export-data.ps1')
  } catch {
    // 静默跳过
  }
}

loadFrontendData()
```

对于大数据迁移，创建一个 PowerShell 脚本将 `src/data/` 编译成 JSON 供 seed 使用（本步骤留给实现阶段处理）。

---

### Task 13: Vite 代理配置 + 前端 API 客户端

**Files:**
- Modify: `vite.config.ts`
- Create: `src/services/client.ts`
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: 修改 `vite.config.ts`** — 添加 `/api` 代理

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 2: 创建 `src/services/client.ts`** — 前端 API 客户端

```typescript
const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // 公开请求不需要 token，所以可选

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// GET 请求
export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint)
}

// POST 请求
export function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })
}

// 带 token 的请求
export function authGet<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' })
}

export function authPost<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })
}

// ========== API 方法 ==========

// 用户
export function login(username: string) {
  return post<{ token: string; user: { id: number; username: string } }>('/auth/login', { username })
}

// 球队
export function getTeams(params?: { group?: string; confederation?: string }) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return get(`/teams${qs}`)
}

export function getTeam(id: string) {
  return get(`/teams/${id}`)
}

// 比赛
export function getMatches(params?: { status?: string; round?: string; date?: string }) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return get(`/matches${qs}`)
}

export function getMatch(id: string) {
  return get(`/matches/${id}`)
}

export function getLiveMatches() {
  return get('/matches/live')
}

export function getMatchAnalysis(matchId: string) {
  return get(`/matches/${matchId}/analysis`)
}

// 积分榜
export function getStandings(group?: string) {
  return get(group ? `/standings/${group}` : '/standings')
}

// 场地
export function getVenues() {
  return get('/venues')
}

export function getVenue(id: string) {
  return get(`/venues/${id}`)
}

// 历史
export function getTournaments() { return get('/history/tournaments') }
export function getRecords() { return get('/history/records') }
export function getCountryHistory() { return get('/history/countries') }

// AI 预测
export function getPrediction(matchId: string) {
  return get(`/predictions/${matchId}`)
}

// 用户预测（需登录）
export function getUserPredictions(params?: { matchId?: string; settled?: boolean }) {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
  return authGet(`/user/predictions${qs}`)
}

export function submitPrediction(data: {
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  predictedResult: 'home_win' | 'draw' | 'away_win'
  confidence: number
}) {
  return authPost('/user/predictions', data)
}

export function getUserStats() {
  return authGet('/user/stats')
}
```

- [ ] **Step 3: 创建 `src/hooks/useAuth.ts`**

```typescript
import { useState, useCallback } from 'react'

interface AuthState {
  username: string
  userId: number
  token: string
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const userId = localStorage.getItem('userId')
    if (token && username && userId) {
      return { token, username, userId: Number(userId) }
    }
    return null
  })

  const login = useCallback(async (username: string) => {
    const { login: apiLogin } = await import('@/services/client')
    const res = await apiLogin(username)
    localStorage.setItem('token', res.token)
    localStorage.setItem('username', res.user.username)
    localStorage.setItem('userId', String(res.user.id))
    setAuth({ token: res.token, username: res.user.username, userId: res.user.id })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    setAuth(null)
  }, [])

  return { auth, login, logout }
}
```

---

### Task 14: 前端页面改造 - Prediction 页面增强

**Files:**
- Modify: `src/pages/Prediction.tsx`
- Create: `src/components/shared/LoginPrompt.tsx`

- [ ] **Step 1: 创建 `src/components/shared/LoginPrompt.tsx`** — 用户名输入弹窗

```typescript
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'

interface Props {
  isOpen: boolean
  onLogin: (username: string) => Promise<void>
}

export function LoginPrompt({ isOpen, onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    try {
      await onLogin(username.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) {} /* 不关闭 */ }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold">输入用户名开始预测</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">输入一个用户名即可参与预测，无需密码。</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="你的用户名"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={30}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? '登录中...' : '开始预测'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: 修改 `src/pages/Prediction.tsx`** — 集成 useAuth + LoginPrompt + API 调用

由于 Prediction.tsx 当前逻辑复杂（展示夺冠概率等），需要保留原有 UI 并新增用户预测功能。修改方案：

1. 保留原有的夺冠概率列表展示
2. 新增「我的预测」区域（若已登录，展示个人预测和统计）
3. 新增 LoginPrompt 组件
4. 为每个 match 添加预测入口（简单形式：选择比分）

完整的 Prediction.tsx 改造代码较长，核心改动如下：

```typescript
// 在文件顶部添加 import
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginPrompt } from '@/components/shared/LoginPrompt'
import { getLiveMatches, getUserPredictions, getUserStats, submitPrediction } from '@/services/client'

// 在组件内部添加
const { auth, login } = useAuth()
const [showLogin, setShowLogin] = useState(false)
const [myStats, setMyStats] = useState<{ total: number; correct: number; winRate: number; totalPoints: number } | null>(null)

// 当 auth 变化时加载用户统计
useEffect(() => {
  if (auth) {
    getUserStats().then(setMyStats).catch(console.error)
  } else {
    setMyStats(null)
  }
}, [auth])

// 在 JSX 中添加登录/用户信息区域
// ... (保留原有夺冠概率 UI)
```

---

### Task 15: 清理旧文件 + 最终验证

**Files:**
- Delete: `src/services/api.ts`
- Delete: `src/services/api-types.ts`
- Delete: `src/data/` (整个目录)
- Modify: 所有 pages 中 `import ... from '@/data'` 替换为 API 调用

- [ ] **Step 1: 检查所有引用 `@/data` 的文件**

```powershell
rg "from ['\"]@/data" --include "*.tsx" --include "*.ts"
```

Expected: 列出所有需要修改的 import。

- [ ] **Step 2: 逐一替换各页面的数据获取**

由于本步骤需要大量逐个页面修改，具体替换在实现时逐页处理。核心模式：

```typescript
// 旧方式
import { teams } from '@/data'
const team = teams.find(t => t.id === id)

// 新方式
import { getTeams, getTeam } from '@/services/client'
const team = await getTeam(id)
```

等所有页面迁移完成后，删除 `src/data/` 和 `src/services/api.ts`、`src/services/api-types.ts`。

- [ ] **Step 3: 删除旧文件**

```powershell
Remove-Item -LiteralPath "src\services\api.ts" -Force
Remove-Item -LiteralPath "src\services\api-types.ts" -Force
Remove-Item -LiteralPath "src\data" -Recurse -Force
```

- [ ] **Step 4: 运行 lint 确保无编译错误**

```powershell
npm run lint
```

- [ ] **Step 5: 启动完整 dev 环境验证**

```powershell
# 终端 1 - 启动后端
cd server; if ($?) { $env:JWT_SECRET = "test-secret"; $env:PORT = "3001"; npx tsx src/index.ts }

# 终端 2 - 启动前端
npm run dev
```

Expected: 前端在 localhost:5173，后端在 localhost:3001，浏览器访问前端正常加载。

---

### Task 16: 集成验证清单

- [ ] `GET /api/teams` 返回数据
- [ ] `GET /api/matches` 返回数据
- [ ] `GET /api/standings` 返回数据
- [ ] `GET /api/venues` 返回数据
- [ ] `GET /api/history/tournaments` 返回数据
- [ ] `POST /api/auth/login` 创建/登录用户
- [ ] `POST /api/user/predictions`（带 token）提交预测
- [ ] `GET /api/user/stats`（带 token）返回统计
- [ ] 前端预测页面可提交预测
- [ ] 前端各页面正常加载数据
- [ ] `npm run lint` 无错误
- [ ] `npm run build` 编译成功
