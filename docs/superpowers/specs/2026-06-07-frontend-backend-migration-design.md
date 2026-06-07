# 世界杯 2026 网站：前端转全栈设计文档

> 日期：2026-06-07 | 状态：待审阅

## 1. 项目背景

当前项目是一个纯前端的世界杯 2026 网站（React + Vite + TypeScript + TailwindCSS），所有数据以静态文件形式存放在 `src/data/`，通过 `src/services/api.ts` 直连 `football-data.org` 外部 API。

目标：改造为前端 + 后端全栈项目，实现数据持久化和实时比分功能。

## 2. 架构决策

### 2.1 整体架构

Monorepo 结构，前后端共享 TypeScript 类型定义。

```
世界杯网站/
├── src/                 # 前端（React + Vite，保持不变）
├── server/              # 后端（新增）
│   ├── src/
│   │   ├── db/          # SQLite 数据库初始化 + 迁移 + Seed 脚本
│   │   ├── routes/      # Express 路由
│   │   ├── services/    # 业务逻辑 + football-data.org 代理
│   │   ├── middleware/   # JWT 认证、rate-limit、错误处理
│   │   ├── validators/  # Zod 校验 schema
│   │   └── index.ts     # Express 入口
│   ├── package.json
│   └── tsconfig.json
├── shared/              # 共享类型（新增，从各文件抽离）
│   └── types/           # Zod schema + TS 类型
├── package.json         # 根 workspace
└── vite.config.ts       # 前端构建配置（调整 proxy）
```

### 2.2 技术栈

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | Express + TypeScript | 生态成熟、前后端同语言 |
| 数据库 | SQLite + better-sqlite3 | 零配置、同步 API、够用 |
| 迁移 | 手写 SQL 脚本 | 简单项目无需 ORM |
| 用户识别 | JWT（仅含 user_id） | 无密码、无邮箱，输入用户名即可 |
| 校验 | Zod | 前后端共享 schema |
| 开发运行 | tsx --watch | 热重载 |
| 生产构建 | tsc | 类型检查 + 编译 |

### 2.3 API 限定

API 仅为内部接口，**不对外暴露**。CORS 仅允许前端域名（开发 localhost:5173，生产实际域名），普通用户通过网页浏览操作，不直接接触 API。

## 3. 安全设计

| 风险 | 措施 |
|---|---|
| API Key 泄露 | football-data.org 的 API Key 仅存后端 `.env`，前端通过后端代理请求 |
| Token 伪造 | JWT 签名 + 强随机 secret，token 长期有效（无敏感数据） |
| SQL 注入 | better-sqlite3 参数化查询，杜绝字符串拼接 |
| XSS | React 默认转义；API 设置 Content-Security-Policy 头 |
| CSRF | JWT 通过 Authorization header 传递，不依赖 cookie |
| CORS | 仅允许前端域名白名单 |
| 输入校验 | 所有 API 入参经 Zod schema 校验 |
| 速率限制 | express-rate-limit 限制 API 调用频率 |
| 环境隔离 | `.env` 不入 git，提供 `.env.example` 模板 |
| HTTPS | 前端 Netlify 自动 HTTPS；后端部署到支持 HTTPS 平台 |
| 依赖安全 | `npm audit` 定期检查 |

## 4. 数据库设计

### 4.1 核心表

**用户**（无密码、无邮箱，仅用户名标识）
```
users
  id (INTEGER PK AUTOINCREMENT)
  username (TEXT UNIQUE NOT NULL)
  created_at (TEXT)
```

**球队**
```
teams
  id (TEXT PK)                  -- 与前端数据 id 对应
  name (TEXT NOT NULL)
  name_en (TEXT)
  flag_code (TEXT)
  confederation (TEXT)
  fifa_rank (INTEGER)
  group_name (TEXT)
  coach_name (TEXT)
  coach_nationality (TEXT)
  coach_age (INTEGER)
  coach_since (TEXT)
  formation (TEXT)
  data_status (TEXT)            -- 'real' | 'pending'
  qualification_status (TEXT)    -- 'qualified' | 'in_progress' | 'pending'
```

**球员**
```
players
  id (TEXT PK)
  team_id (TEXT FK → teams.id)
  name (TEXT NOT NULL)
  number (INTEGER)
  position (TEXT)
  club (TEXT)
  club_logo (TEXT)
  age (INTEGER)
  height (INTEGER)
  weight (INTEGER)
  nationality (TEXT)
  flag_code (TEXT)
  preferred_foot (TEXT)
  market_value (INTEGER)
  photo_url (TEXT)
  birth_date (TEXT)
  abilities (TEXT)              -- JSON: {shooting, passing, dribbling, speed, defense, physical}
  tournament_stats (TEXT)       -- JSON: {appearances, goals, assists, yellowCards, redCards, minutesPlayed, averageRating}
```

**球员俱乐部历史**
```
club_history
  id (INTEGER PK AUTOINCREMENT)
  player_id (TEXT FK → players.id)
  club_name (TEXT NOT NULL)
  period (TEXT)
  appearances (INTEGER)
  goals (INTEGER)
```

**球队世界杯历史**
```
world_cup_history
  id (INTEGER PK AUTOINCREMENT)
  team_id (TEXT FK → teams.id)
  year (INTEGER NOT NULL)
  result (TEXT)
  host (TEXT)
  matches_played (INTEGER)
  wins (INTEGER)
  draws (INTEGER)
  losses (INTEGER)
  goals_for (INTEGER)
  goals_against (INTEGER)
```

**比赛**
```
matches
  id (TEXT PK)
  home_team_id (TEXT FK → teams.id)
  away_team_id (TEXT FK → teams.id)
  home_score (INTEGER)
  away_score (INTEGER)
  status (TEXT NOT NULL)        -- 'pending' | 'live' | 'finished'
  date (TEXT NOT NULL)
  venue_id (TEXT FK → venues.id)
  city (TEXT)
  group_name (TEXT)
  round (TEXT)
  half_time_home_score (INTEGER)
  half_time_away_score (INTEGER)
  updated_at (TEXT)
```

**比赛事件**
```
match_events
  id (INTEGER PK AUTOINCREMENT)
  match_id (TEXT FK → matches.id)
  minute (INTEGER NOT NULL)
  type (TEXT NOT NULL)          -- 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  player_name (TEXT NOT NULL)
  team (TEXT NOT NULL)          -- 'home' | 'away'
  detail (TEXT)
```

**比赛统计**
```
match_stats
  id (INTEGER PK AUTOINCREMENT)
  match_id (TEXT FK → matches.id UNIQUE)
  possession_home (INTEGER)
  possession_away (INTEGER)
  shots_home (INTEGER)
  shots_away (INTEGER)
  shots_on_target_home (INTEGER)
  shots_on_target_away (INTEGER)
  corners_home (INTEGER)
  corners_away (INTEGER)
  yellows_home (INTEGER)
  yellows_away (INTEGER)
  reds_home (INTEGER)
  reds_away (INTEGER)
  fouls_home (INTEGER)
  fouls_away (INTEGER)
```

**阵容**
```
lineups
  id (INTEGER PK AUTOINCREMENT)
  match_id (TEXT FK → matches.id)
  team (TEXT NOT NULL)          -- 'home' | 'away'
  player_name (TEXT NOT NULL)
```

**积分榜**
```
standings
  id (INTEGER PK AUTOINCREMENT)
  group_name (TEXT NOT NULL)
  team_id (TEXT FK → teams.id)
  rank (INTEGER NOT NULL)
  played (INTEGER)
  won (INTEGER)
  drawn (INTEGER)
  lost (INTEGER)
  goals_for (INTEGER)
  goals_against (INTEGER)
  goal_difference (INTEGER)
  points (INTEGER)
  recent_form (TEXT)            -- JSON: ["W","D","L",...]
  data_status (TEXT)            -- 'pending' | 'live' | 'final'
```

**场地**
```
venues
  id (TEXT PK)
  name (TEXT NOT NULL)
  city (TEXT)
  country (TEXT)
  capacity (INTEGER)
  image_url (TEXT)
  matches_count (INTEGER)
  description (TEXT)
```

**历届世界杯**
```
tournaments
  id (INTEGER PK AUTOINCREMENT)
  year (INTEGER NOT NULL)
  host (TEXT)
  host_flag_code (TEXT)
  champion (TEXT)
  champion_flag_code (TEXT)
  runner_up (TEXT)
  runner_up_flag_code (TEXT)
  third_place (TEXT)
  third_place_flag_code (TEXT)
  fourth_place (TEXT)
  fourth_place_flag_code (TEXT)
  top_scorer (TEXT)
  top_scorer_goals (INTEGER)
  best_player (TEXT)
  best_goalkeeper (TEXT)
  total_goals (INTEGER)
  total_matches (INTEGER)
  total_attendance (INTEGER)
  teams_count (INTEGER)
```

**世界杯纪录**
```
world_cup_records
  id (TEXT PK)
  title (TEXT NOT NULL)
  description (TEXT)
  detail (TEXT)
  category (TEXT)               -- 'team' | 'player' | 'match' | 'tournament'
```

**各国历史战绩**
```
country_history
  id (INTEGER PK AUTOINCREMENT)
  country_name (TEXT NOT NULL)
  flag_code (TEXT)
  appearances (INTEGER)
  titles (INTEGER)
  total_matches (INTEGER)
  wins (INTEGER)
  draws (INTEGER)
  losses (INTEGER)
  goals_for (INTEGER)
  goals_against (INTEGER)
  best_result (TEXT)
```

### 4.2 预测表

**历史交锋记录**
```
head_to_head
  id (INTEGER PK AUTOINCREMENT)
  team_a_id (TEXT FK → teams.id)
  team_b_id (TEXT FK → teams.id)
  date (TEXT NOT NULL)
  tournament (TEXT)
  team_a_score (INTEGER)
  team_b_score (INTEGER)
```

**系统/AI 预测**
```
predictions
  id (INTEGER PK AUTOINCREMENT)
  match_id (TEXT FK → matches.id UNIQUE)
  home_win_prob (REAL)          -- 0-1
  draw_prob (REAL)              -- 0-1
  away_win_prob (REAL)          -- 0-1
  most_likely_score (TEXT)
  second_likely_score (TEXT)
  most_likely_score_prob (REAL)
  second_likely_score_prob (REAL)
  key_factors (TEXT)            -- JSON
  home_rating (TEXT)            -- JSON
  away_rating (TEXT)            -- JSON
  home_recent_form (TEXT)       -- JSON
  away_recent_form (TEXT)       -- JSON
  created_at (TEXT)
  updated_at (TEXT)
```

**用户预测**
```
user_predictions
  id (INTEGER PK AUTOINCREMENT)
  user_id (INTEGER FK → users.id)
  match_id (TEXT FK → matches.id)
  predicted_home_score (INTEGER)
  predicted_away_score (INTEGER)
  predicted_result (TEXT)       -- 'home_win' | 'draw' | 'away_win'
  confidence (INTEGER)          -- 1-5 星
  is_correct (INTEGER)          -- NULL=未结算, 1=正确, 0=错误
  points_earned (INTEGER)       -- NULL 未结算，结算后为所得积分
  created_at (TEXT)
  settled_at (TEXT)             -- 结算时间
```

## 5. 预测模块详细设计

### 5.1 预测页面辅助信息

用户预测界面对阵两队时展示：

- 两队近期战绩（近 5 场胜/平/负）— 来自 matches 表
- 历史交锋记录 — 来自 head_to_head 表
- FIFA 排名 — 来自 teams 表
- 球员能力值与身价 — 来自 players 表
- 小组积分榜排名 — 来自 standings 表
- AI 预测概率参考 — 来自 predictions 表（系统）

### 5.2 积分规则

用户猜对后给予积分奖励，积分仅作为个人激励（类似经验值），**不做公开排行**：

| 猜中内容 | 积分 |
|---|---|
| 胜平负结果正确 | +10 |
| 比分完全正确 | +25（含胜平负的 10 分） |
| 高信心猜对 | + confidence × 2 |

### 5.3 赛后结算

- 比赛 status 变为 'finished' 后触发结算
- 比较用户预测与实际比分
- 更新 is_correct、points_earned、settled_at
- 用户胜率从 user_predictions 实时计算：`correct / total WHERE is_correct IS NOT NULL`

## 6. API 路由设计

API 为内部接口，仅前端页面调用，不对外暴露。

### 6.1 用户识别

用户浏览无需登录。仅预测时需提供用户名获取 token。

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/api/auth/login` | 输入用户名，存在则返回 token，不存在则自动创建用户并返回 token | 无 |

### 6.2 球队

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/teams` | 球队列表，支持 `?group=X&confederation=X` | 无 |
| GET | `/api/teams/:id` | 球队详情（含球员列表） | 无 |

### 6.3 比赛

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/matches` | 赛程列表，支持 `?status=&round=&date=` | 无 |
| GET | `/api/matches/:id` | 比赛详情（含事件、统计、阵容） | 无 |
| GET | `/api/matches/live` | 实时比分（轮询此接口） | 无 |
| GET | `/api/matches/:id/analysis` | 赛前分析（交锋、近期战绩、两队对比） | 无 |

### 6.4 积分榜

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/standings` | 所有小组积分榜 | 无 |
| GET | `/api/standings/:group` | 指定小组积分榜 | 无 |

### 6.5 场地

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/venues` | 场地列表 | 无 |
| GET | `/api/venues/:id` | 场地详情 | 无 |

### 6.6 历史

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/history/tournaments` | 历届世界杯 | 无 |
| GET | `/api/history/records` | 世界杯纪录 | 无 |
| GET | `/api/history/countries` | 各国历史战绩 | 无 |

### 6.7 预测（公开）

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/predictions/:matchId` | 获取某场比赛 AI 预测 | 无 |
| POST | `/api/predictions/refresh` | 触发 AI 重新预测（管理用） | admin |

### 6.8 用户预测（需认证）

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/api/user/predictions` | 我的预测列表，支持 `?matchId=&settled=` | JWT |
| POST | `/api/user/predictions` | 提交/更新预测 | JWT |
| GET | `/api/user/stats` | 我的胜率统计（total, correct, win_rate, total_points） | JWT |

## 7. 实时比分实现

- 前端轮询 `GET /api/matches/live`（比赛日约 30s 间隔，非比赛日降低频率）
- 后端该接口先查本地数据库 `status='live'` 的比赛；若数据库为空则代理请求 `football-data.org` 并将结果写入缓存
- 比赛状态变更时（live → finished），触发预测结算

## 8. API Key 迁移

当前 `VITE_FOOTBALL_DATA_API_KEY` 通过 `import.meta.env` 暴露在前端。改造后：

- API Key 仅存在后端 `.env` 文件
- 前端所有数据请求改为调用自己的 `/api/` 路由
- 后端在需要外部数据时（如实时比分）代请求 football-data.org
- Vite 开发时 `server.proxy` 将 `/api` 代理到后端端口

## 9. 前端改动范围

| 改动 | 说明 |
|---|---|
| 删除 `src/services/api.ts` | 不再直连外部 API |
| 新增 `src/services/client.ts` | 封装对后端 `/api/` 的请求 |
| 删除 `src/data/` | 静态数据迁移到数据库 seed |
| 调整各页面数据获取 | 从本地数据改为 API 调用 |
| 预测页增强 | 展示辅助信息 + 用户提交预测表单；用户名输入框（仅首次提示输入） |
| `vite.config.ts` 添加 proxy | `/api` → `http://localhost:3001` |
