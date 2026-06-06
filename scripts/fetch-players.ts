/**
 * 从 TheSportsDB API 拉取真实球员数据并更新 teams.ts。
 * 用法: npx tsx scripts/fetch-players.ts
 */
import * as fs from "fs"
import * as path from "path"

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3"
const TEAMS_PATH = path.resolve("src/data/teams.ts")

// ============= 工具函数 =============

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** 解析身高 cm */
function parseHeight(h: string | undefined): number {
  if (!h) return 178
  const m = h.match(/([\d.]+)\s*m/) ?? h.match(/(\d+)\s*cm/)
  if (m) return Math.round(parseFloat(m[1]) * (h.includes("m") && !h.includes("cm") ? 100 : 1))
  const fi = h.match(/(\d+)\s*ft\s*(\d+)/)
  if (fi) return Math.round(parseInt(fi[1]) * 30.48 + parseInt(fi[2]) * 2.54)
  return 178
}

/** 解析体重 kg */
function parseWeight(w: string | undefined): number {
  if (!w) return 72
  const kg = w.match(/(\d+)\s*[Kk]g/)
  if (kg) return parseInt(kg[1])
  const lbs = w.match(/(\d+)\s*lbs/)
  if (lbs) return Math.round(parseInt(lbs[1]) * 0.4536)
  return 72
}

/** TSDB 位置 → 简写 */
function mapPosition(pos: string | undefined): string {
  if (!pos) return "CM"
  const p = pos.toLowerCase()
  if (p.includes("goalkeeper")) return "GK"
  if (p.includes("centre-back") || p.includes("center back")) return "CB"
  if (p.includes("left-back")) return "LB"
  if (p.includes("right-back")) return "RB"
  if (p.includes("defensive mid")) return "CDM"
  if (p.includes("central mid") || p.includes("centre mid")) return "CM"
  if (p.includes("attacking mid")) return "CAM"
  if (p.includes("left wing") || p.includes("left mid")) return "LW"
  if (p.includes("right wing") || p.includes("right mid")) return "RW"
  if (p.includes("striker") || p.includes("centre-forward") || p.includes("center forward")) return "ST"
  if (p.includes("forward")) return "ST"
  if (p.includes("midfield")) return "CM"
  if (p.includes("defender")) return "CB"
  return "CM"
}

/** 惯用脚 */
function mapFoot(side: string | undefined): "左" | "右" | "双" {
  if (!side) return "右"
  const s = side.toLowerCase()
  if (s === "left") return "左"
  if (s === "right") return "右"
  return "右"
}

/** 估算身价 */
function estimateMV(pos: string, age: number): number {
  const base: Record<string, number> = {
    GK: 8_000_000, CB: 20_000_000, LB: 15_000_000, RB: 15_000_000,
    CDM: 22_000_000, CM: 28_000_000, CAM: 32_000_000,
    LW: 35_000_000, RW: 35_000_000, ST: 40_000_000,
  }
  const b = base[pos] ?? 20_000_000
  if (age <= 21) return Math.round(b * 1.3)
  if (age <= 25) return Math.round(b * 1.0)
  if (age <= 29) return Math.round(b * 0.75)
  if (age <= 32) return Math.round(b * 0.35)
  return Math.round(b * 0.12)
}

/** 能力值 */
function estAbilities(pos: string, mv: number, age: number) {
  const f = Math.min(mv / 50_000_000, 1.4)
  const bonus = age >= 24 && age <= 29 ? 4 : 0
  const r = (lo: number, hi: number) => Math.min(99, Math.round(lo + (hi - lo) * f) + bonus)

  const map: Record<string, () => any> = {
    GK: () => ({ shooting: 20, passing: 55, dribbling: 45, speed: 50, defense: r(68, 90), physical: r(62, 85) }),
    CB: () => ({ shooting: r(30, 50), passing: r(50, 75), dribbling: r(38, 62), speed: r(48, 72), defense: r(70, 90), physical: r(68, 88) }),
    LB: () => ({ shooting: r(35, 55), passing: r(58, 80), dribbling: r(52, 78), speed: r(68, 90), defense: r(58, 82), physical: r(52, 75) }),
    RB: () => ({ shooting: r(35, 55), passing: r(58, 80), dribbling: r(52, 78), speed: r(68, 90), defense: r(58, 82), physical: r(52, 75) }),
    CDM: () => ({ shooting: r(42, 65), passing: r(62, 82), dribbling: r(48, 70), speed: r(48, 70), defense: r(68, 88), physical: r(70, 88) }),
    CM: () => ({ shooting: r(52, 75), passing: r(70, 90), dribbling: r(58, 80), speed: r(52, 75), defense: r(48, 70), physical: r(58, 78) }),
    CAM: () => ({ shooting: r(58, 80), passing: r(70, 90), dribbling: r(68, 90), speed: r(58, 78), defense: r(28, 48), physical: r(48, 70) }),
    LW: () => ({ shooting: r(58, 78), passing: r(62, 82), dribbling: r(72, 93), speed: r(75, 93), defense: r(22, 42), physical: r(48, 70) }),
    RW: () => ({ shooting: r(58, 78), passing: r(62, 82), dribbling: r(72, 93), speed: r(75, 93), defense: r(22, 42), physical: r(48, 70) }),
    ST: () => ({ shooting: r(72, 92), passing: r(52, 75), dribbling: r(62, 85), speed: r(65, 88), defense: r(18, 35), physical: r(58, 80) }),
  }
  return (map[pos] ?? map["CM"])()
}

/** 计算 2026 年 6 月的年龄 */
function calcAge(birth: string | undefined): number {
  if (!birth) return 26
  const b = new Date(birth)
  const ref = new Date("2026-06-01")
  let age = ref.getFullYear() - b.getFullYear()
  if (ref.getMonth() < b.getMonth() || (ref.getMonth() === b.getMonth() && ref.getDate() < b.getDate())) age--
  return Math.max(17, age)
}

interface TSDBPlayer {
  idPlayer: string
  strPlayer: string
  strTeam: string
  strPosition: string
  strNumber: string
  dateBorn: string
  strHeight: string
  strWeight: string
  strThumb: string
  strCutout: string
  strSide: string
}

interface TSDBTeam {
  idTeam: string
  strTeam: string
  strLeague: string
}

// ============= 主逻辑 =============

async function findTeam(nameEn: string): Promise<string | null> {
  const url = `${API_BASE}/searchteams.php?t=${encodeURIComponent(nameEn)}`
  const res = await fetchJson<{ teams: TSDBTeam[] | null }>(url)
  if (!res?.teams) return null
  const national = res.teams.find((t) => t.strLeague === "FIFA World Cup")
  return national?.idTeam ?? null
}

async function getPlayers(teamId: string): Promise<TSDBPlayer[]> {
  const url = `${API_BASE}/lookup_all_players.php?id=${teamId}`
  const res = await fetchJson<{ player: TSDBPlayer[] | null }>(url)
  return res?.player ?? []
}

function buildPlayer(p: TSDBPlayer, flagCode: string, usedIds: Set<string>): any {
  const pos = mapPosition(p.strPosition)
  const age = calcAge(p.dateBorn)
  const mv = estimateMV(pos, age)

  // 生成唯一 ID
  let base = p.strPlayer
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // 去重音
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20) || `p${Date.now()}`
  let id = base
  let s = 1
  while (usedIds.has(id)) { id = `${base}${s}`; s++ }
  usedIds.add(id)

  return {
    id,
    name: p.strPlayer,
    number: parseInt(p.strNumber) || 0,
    position: pos,
    club: p.strTeam || "",
    age,
    height: parseHeight(p.strHeight),
    weight: parseWeight(p.strWeight),
    nationality: "",
    flagCode: "",
    preferredFoot: mapFoot(p.strSide),
    birthDate: p.dateBorn || "",
    marketValue: mv,
    photoUrl: p.strCutout || p.strThumb || "",
    abilities: estAbilities(pos, mv, age),
    tournamentStats: {
      appearances: 0, goals: 0, assists: 0,
      yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 0,
    },
    careerSummary: {
      firstAppearance: "",
      totalCaps: 0,
      totalGoals: 0,
      majorTournaments: [] as string[],
      clubs: [{
        clubName: p.strTeam || "",
        period: "至今",
        appearances: 0,
        goals: 0,
      }],
    },
  }
}

async function main() {
  // 读取原始文件
  console.log("读取 teams.ts...")
  let content = fs.readFileSync(TEAMS_PATH, "utf-8")

  // 提取球队列表
  const teamRegex = /\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"nameEn":\s*"([^"]+)"/g
  const teamList: { id: string; name: string; nameEn: string }[] = []
  let m: RegExpExecArray | null
  while ((m = teamRegex.exec(content)) !== null) {
    teamList.push({ id: m[1], name: m[2], nameEn: m[3] })
  }

  console.log(`找到 ${teamList.length} 支球队\n`)
  let totalPlayers = 0
  let successCount = 0

  for (let i = 0; i < teamList.length; i++) {
    const team = teamList[i]
    process.stdout.write(`[${i + 1}/${teamList.length}] ${team.name} (${team.nameEn})... `)

    const tsdbId = await findTeam(team.nameEn)
    if (!tsdbId) {
      console.log("❌ 未找到")
      await sleep(800)
      continue
    }

    const players = await getPlayers(tsdbId)
    if (players.length === 0) {
      console.log("❌ 无球员")
      await sleep(800)
      continue
    }

    // 转换球员数据
    const usedIds = new Set<string>()
    const newPlayers = players
      .filter((p) => p.strPosition)
      .slice(0, 26)
      .map((p) => buildPlayer(p, team.id, usedIds))

    // 在 teams.ts 中替换该队的 players 数组
    // 找 "id": "<teamId>" 之后最近的 "players": [
    const teamStartMarker = `"id": "${team.id}"`
    const teamStartIdx = content.indexOf(teamStartMarker)
    if (teamStartIdx === -1) {
      console.log("❌ 文件定位失败")
      await sleep(800)
      continue
    }

    // 从 teamStartIdx 往后找 "players": [
    const searchStart = teamStartIdx
    const playersKeyIdx = content.indexOf('"players": [', searchStart)
    if (playersKeyIdx === -1) {
      console.log("❌ players 数组定位失败")
      await sleep(800)
      continue
    }

    const playersStartIdx = playersKeyIdx + '"players": ['.length

    // 括号匹配找 players 数组结束
    let depth = 1, endIdx = playersStartIdx, inStr = false, esc = false
    for (let j = playersStartIdx; j < content.length; j++) {
      const ch = content[j]
      if (esc) { esc = false; continue }
      if (ch === "\\") { esc = true; continue }
      if (ch === '"') { inStr = !inStr; continue }
      if (inStr) continue
      if (ch === "[") depth++
      else if (ch === "]") { depth--; if (depth === 0) { endIdx = j; break } }
    }

    // 确定缩进
    const beforeSlice = content.slice(Math.max(0, playersKeyIdx - 60), playersKeyIdx)
    const indentMatch = beforeSlice.match(/\n(\s+)$/)
    const baseIndent = indentMatch ? indentMatch[1] : "      "
    const itemIndent = baseIndent + "  "

    // 保留原有球员（保留前几个，追加新的）
    const existingBlock = content.slice(playersStartIdx, endIdx).trim()
    const existingPlayers: string[] = []
    if (existingBlock) {
      // 简单拆分（按 "}," 或 "}" 后跟换行）
      const parts = existingBlock.split(/\n(?=\s*\{)/)
      for (const part of parts) {
        if (part.trim()) existingPlayers.push(part)
      }
    }

    // 合并：保留原有，追加新球员（不超过 23 人）
    const merged = [...existingPlayers]
    for (const np of newPlayers) {
      if (merged.length >= 23) break
      const playerJson = JSON.stringify(np, null, 2)
      const indented = playerJson.split("\n").map((l, idx) =>
        idx === 0 ? itemIndent + l : itemIndent + l
      ).join("\n")
      merged.push(indented)
    }

    const newBlock = merged.length > 0
      ? "\n" + merged.join(",\n") + "\n" + baseIndent
      : ""

    content = content.slice(0, playersStartIdx) + newBlock + content.slice(endIdx)

    console.log(`✅ ${newPlayers.length} 人 (总计 ${merged.length})`)
    totalPlayers += newPlayers.length
    successCount++
    await sleep(1000) // 速率限制
  }

  // 写回文件
  fs.writeFileSync(TEAMS_PATH, content, "utf-8")
  console.log(`\n完成！${successCount}/${teamList.length} 队成功，新增 ${totalPlayers} 名球员`)
  console.log("运行 npx tsc --noEmit 验证编译...")
}

main().catch(console.error)
