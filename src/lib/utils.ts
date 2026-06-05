import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化数字，添加千分位 */
export function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN")
}

/** 格式化金额（欧元） */
export function formatCurrency(n: number): string {
  if (n >= 100_000_000) return `€${(n / 100_000_000).toFixed(2)}亿`
  if (n >= 10_000) return `€${(n / 10_000).toFixed(0)}万`
  return `€${n.toLocaleString("zh-CN")}`
}

/** 格式化日期为中文 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** 格式化北京时间 */
export function formatBeijingTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  })
}

/** 小组编号转字母 */
export function groupIndexToLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

/** 洲际中文名映射 */
export const confederationNames: Record<string, string> = {
  UEFA: "欧洲",
  CONMEBOL: "南美洲",
  CONCACAF: "中北美",
  AFC: "亚洲",
  CAF: "非洲",
  OFC: "大洋洲",
}

/** 位置中文名映射 */
export const positionNames: Record<string, string> = {
  GK: "门将",
  CB: "中后卫",
  LB: "左后卫",
  RB: "右后卫",
  CDM: "后腰",
  CM: "中场",
  CAM: "前腰",
  LM: "左边锋",
  RM: "右边锋",
  LW: "左边锋",
  RW: "右边锋",
  ST: "前锋",
  CF: "中锋",
}
