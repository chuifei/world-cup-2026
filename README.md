# 🏆 2026 FIFA World Cup 世界杯资讯网站

> 个人作品集项目 · 全栈 · 深色足球运动风

在线地址：`https://visionary-basbousa-d357e8.netlify.app`

---

## 项目简介

面向中文用户的 2026 世界杯资讯展示型网站，覆盖赛事数据、球队球员信息、AI 比分预测、观赛指南、历史长廊等功能。支持用户输入用户名参与比赛预测，获取个人积分。

---

## 技术栈

| 类别 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| UI | Tailwind CSS + 自研组件库 |
| 路由 | React Router v6（懒加载 + 代码分割） |
| 动画 | Framer Motion（页面过渡 + 滚动入场） |
| 图表 | Recharts（雷达图 + 条形图） |
| 图标 | Lucide React |
| 后端 | Express 4.x + TypeScript |
| 数据库 | SQLite（node:sqlite，Node.js 内置） |
| 实时数据 | football-data.org API（代理） |
| 认证 | JWT（用户名登录，无密码） |
| 校验 | Zod（前后端共享） |
| 构建 | Vite 5（前端）+ tsx（后端） |
| 部署 | Netlify（前端自动 CI/CD） |

---

## 功能模块

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | 倒计时、赛程预览、数据快览、热门球队、明星球员 |
| 赛事中心 | `/matches` | 小组赛、12组积分榜、淘汰赛对阵树 |
| 赛事预测 | `/prediction` | AI 夺冠概率 + 用户比分预测 + 个人积分统计 |
| 球队列表 | `/teams` | 48 支球队按洲际筛选、FIFA 排名展示 |
| 球队详情 | `/teams/:id` | 概况 / 球员名单 / 历史成绩 |
| 球员列表 | `/players` | 搜索 + 球队/位置筛选 |
| 球员详情 | `/players/:id` | 能力雷达图、职业生涯 |
| 观赛指南 | `/guide` | 赛程日历、直播渠道、16座城市场馆 |
| 历史长廊 | `/history` | 1930-2022 历届回顾、纪录墙、各国战绩 |

---

## 项目结构

```
世界杯网站/
├── src/                    # 前端
│   ├── components/         # layout/, ui/, shared/
│   ├── pages/              # 10 个页面组件
│   ├── data/               # 静态数据（团队、比赛、积分榜等）
│   ├── services/           # client.ts（后端 API 客户端）
│   ├── hooks/              # useAuth, useCountUp, useInView 等
│   ├── types/              # 类型重导出（→ shared/types/）
│   └── constants/
├── server/                 # 后端
│   ├── src/
│   │   ├── db/             # SQLite schema + seed 脚本
│   │   ├── routes/         # auth, teams, matches, standings, venues, history, predictions
│   │   ├── services/       # football-data.org 代理 + 预测结算
│   │   ├── middleware/      # JWT 认证、限流、错误处理
│   │   ├── validators/     # Zod 校验中间件
│   │   └── index.ts        # Express 入口
│   └── package.json
├── shared/                 # 前后端共享类型
│   └── types/              # Zod Schema + TypeScript 类型
├── package.json            # 根 workspace
└── vite.config.ts
```

---

## API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 用户名登录（自动创建用户） |
| GET | `/api/teams` | 球队列表 |
| GET | `/api/teams/:id` | 球队详情 |
| GET | `/api/matches` | 赛程列表 |
| GET | `/api/matches/:id` | 比赛详情 |
| GET | `/api/matches/live` | 实时比分 |
| GET | `/api/matches/:id/analysis` | 赛前分析 |
| GET | `/api/standings` | 积分榜 |
| GET | `/api/venues` | 场地列表 |
| GET | `/api/history/tournaments` | 历届世界杯 |
| GET | `/api/history/records` | 世界杯纪录 |
| GET | `/api/predictions/:matchId` | AI 预测 |
| GET | `/api/user/predictions` | 我的预测（需 token） |
| POST | `/api/user/predictions` | 提交预测（需 token） |
| GET | `/api/user/stats` | 我的胜率统计（需 token） |

---

## 本地运行

```bash
# 安装依赖
npm install
cd server && npm install && cd ..

# 初始化数据库（可选，首次运行时自动创建）
cd server && npm run seed && cd ..

# 启动后端（端口 3001）
cd server && npm run dev

# 启动前端（端口 5173，自动代理 /api → 3001）
npm run dev
```

环境变量（`server/.env`，参考 `server/.env.example`）：

```
PORT=3001
JWT_SECRET=your-random-secret
FOOTBALL_DATA_API_KEY=your-api-key     # 可选，用于实时比分
WORLD_CUP_ID_2026=                     # 赛事 ID（赛程临近时填写）
CORS_ORIGIN=http://localhost:5173
```

---

## 预测积分规则

| 猜中内容 | 积分 |
|---|---|
| 胜平负结果正确 | +10 |
| 比分完全正确 | +25 |
| 高信心猜对 | + 信心值(1-5) × 2 |

积分仅作为个人激励，不做公开排行。

---

## 数据来源

| 数据类型 | 来源 |
|---|---|
| 球员照片 | TheSportsDB API |
| 赛程 | FIFA 官方（72 场小组赛 + 淘汰赛） |
| 球队分组 | FIFA 官方抽签 2025.12.5 |
| FIFA 排名 | FIFA 官网 |
| 历史数据 | FIFA 官方 + Wikipedia |
| 实时比分 | football-data.org（代理） |
