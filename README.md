# 🏆 2026 FIFA World Cup 世界杯资讯展示网站

> 个人作品集项目 · 纯前端 · 深色足球运动风

在线地址：`https://visionary-basbousa-d357e8.netlify.app`

---

## 项目简介

面向中文用户的 2026 世界杯资讯展示型网站，涵盖赛事数据、球队球员信息、AI 比分预测、观赛指南、历史长廊等功能。无需登录注册，所有数据通过免费 API + Mock 数据完整运行。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI | Tailwind CSS + 自研组件库 |
| 路由 | React Router v6（懒加载 + 代码分割） |
| 动画 | Framer Motion（页面过渡 + 滚动入场） |
| 图表 | Recharts（雷达图 + 条形图） |
| 图标 | Lucide React |
| SEO | React Helmet Async |
| 构建 | Vite 5 |
| 部署 | Netlify（自动 CI/CD） |

---

## 功能模块

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 倒计时、赛程预览、数据快览、热门球队、明星球员 |
| 赛事中心 | `/matches` | 小组赛（国旗+时间布局）、12组积分榜、淘汰赛对阵树 |
| AI 预测 | `/prediction` | 球队夺冠概率、多维度评分对比 |
| 球队列表 | `/teams` | 48 支球队按洲际筛选、FIFA 排名展示 |
| 球队详情 | `/teams/:id` | 概况/球员名单/历史成绩/预选赛表现 |
| 球员列表 | `/players` | 搜索 + 球队/位置筛选 |
| 球员详情 | `/players/:id` | 真实照片、能力雷达图、职业生涯、预选赛表现 |
| 观赛指南 | `/guide` | 赛程日历、直播渠道、世界杯百科、16座城市场馆 |
| 历史长廊 | `/history` | 1930-2022 历届回顾、纪录墙、各国战绩排行 |

---

## 数据源

| 数据类型 | 来源 |
|----------|------|
| 球员照片 | TheSportsDB API（179/187 名球员真实抠图） |
| 球员资料 | FIFA 官方阵容 PDF 2026.6.2（姓名/位置/俱乐部/身高/出生日期） |
| 赛程 | FIFA 官方（72 场小组赛 + 淘汰赛，北京时间） |
| 球队分组 | FIFA 官方抽签 2025.12.5（12 组 A-L） |
| FIFA 排名 | FIFA 官网 2025.11 最新排名 |
| 历史数据 | FIFA 官方 + Wikipedia（1930-2022 全数据） |
| AI 预测 | 模拟数据（标注"AI 模拟"） |

---

## 响应式设计

- **移动端** <768px：单列 + 底部 Tab 导航 + 汉堡菜单
- **平板** 768-1024px：双列 Grid
- **桌面** >1024px：完整导航 + 多列 + 侧边栏

## 数据状态标注

| 标识 | 含义 | 示例 |
|------|------|------|
| 🟢 已确认 | 官方来源 | FIFA 排名、历届冠军 |
| 🔘 尚未公布 | 赛事未开始 | 积分榜、比赛结果 |
| 🟡 AI 模拟 | 算法生成 | 夺冠概率、球员身价 |

---

## 本地运行

```bash
npm install
npm run dev        # 开发 http://localhost:5173
npm run build      # 构建到 dist/
npm run preview    # 预览
```

---

## 项目结构

```
src/
├── components/
│   ├── layout/     # Header, Footer, MobileNav, Layout, ScrollToTop
│   ├── ui/         # Button, Card, Tabs, Badge, Skeleton
│   └── shared/     # FlagImage, PlayerCard, TeamCard, MatchCard 等
├── pages/          # 10 个页面组件
├── data/           # 10 个 Mock 数据文件
├── services/       # API 封装层
├── hooks/          # useCountUp, useInView, useMediaQuery, useDebounce
├── types/          # TypeScript 类型定义
└── constants/      # 洲际/位置映射等常量
```
