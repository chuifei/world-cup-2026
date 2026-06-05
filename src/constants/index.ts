// 小组映射
export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const
export type GroupLetter = (typeof GROUPS)[number]

// 洲际映射
export const CONFEDERATIONS = {
  UEFA: { name: "欧洲", color: "#3B82F6" },
  CONMEBOL: { name: "南美洲", color: "#22C55E" },
  CONCACAF: { name: "中北美", color: "#F97316" },
  AFC: { name: "亚洲", color: "#EF4444" },
  CAF: { name: "非洲", color: "#EAB308" },
  OFC: { name: "大洋洲", color: "#8B5CF6" },
} as const

// 位置映射
export const POSITIONS: Record<string, { name: string; icon: string }> = {
  GK: { name: "门将", icon: "🧤" },
  CB: { name: "中后卫", icon: "🛡️" },
  LB: { name: "左后卫", icon: "🛡️" },
  RB: { name: "右后卫", icon: "🛡️" },
  CDM: { name: "后腰", icon: "⚔️" },
  CM: { name: "中场", icon: "🎯" },
  CAM: { name: "前腰", icon: "🎯" },
  LM: { name: "左边锋", icon: "⚡" },
  RM: { name: "右边锋", icon: "⚡" },
  LW: { name: "左边锋", icon: "⚡" },
  RW: { name: "右边锋", icon: "⚡" },
  ST: { name: "前锋", icon: "⚽" },
  CF: { name: "中锋", icon: "⚽" },
}

// 举办城市
export const HOST_CITIES = [
  "墨西哥城", "瓜达拉哈拉", "蒙特雷",
  "纽约", "洛杉矶", "迈阿密", "达拉斯",
  "亚特兰大", "休斯顿", "堪萨斯城",
  "波士顿", "费城", "旧金山", "西雅图",
  "多伦多", "温哥华",
]

// 举办国
export const HOST_COUNTRIES = ["美国", "加拿大", "墨西哥"]

// 赛事基本信息
export const TOURNAMENT_INFO = {
  year: 2026,
  teams: 48,
  groupMatches: 72,
  totalMatches: 104,
  hostCities: 16,
  estimatedPlayers: 1104,
  startDate: "2026-06-11",
  endDate: "2026-07-19",
}
