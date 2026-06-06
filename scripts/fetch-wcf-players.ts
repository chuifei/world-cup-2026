/**
 * 从 worldcupfifa.com.tw 批量抓取球员数据并更新 teams.ts
 * 用法: npx tsx scripts/fetch-wcf-players.ts
 */
import * as fs from "fs"
import * as path from "path"

const BASE = "https://www.worldcupfifa.com.tw/blog/categories/qiuyuan/page"
const TEAMS_PATH = path.resolve("src/data/teams.ts")
const TOTAL_PAGES = 7

// 中文队名 → 我们的 team.id
const TEAM_NAME_MAP: Record<string, string> = {
  "西班牙": "spain", "阿根廷": "argentina", "法國": "france", "法国": "france",
  "英格蘭": "england", "英格兰": "england", "巴西": "brazil", "葡萄牙": "portugal",
  "荷蘭": "netherlands", "荷兰": "netherlands", "比利時": "belgium", "比利时": "belgium",
  "德國": "germany", "德国": "germany", "克羅埃西亞": "croatia", "克罗地亚": "croatia",
  "摩洛哥": "morocco", "哥倫比亞": "colombia", "哥伦比亚": "colombia",
  "美國": "usa", "美国": "usa", "美國隊": "usa", "美国队": "usa",
  "墨西哥": "mexico", "烏拉圭": "uruguay", "乌拉圭": "uruguay",
  "瑞士": "switzerland", "日本": "japan", "塞內加爾": "senegal", "塞内加尔": "senegal",
  "伊朗": "iran", "韓國": "southkorea", "南韓": "southkorea", "韩国": "southkorea",
  "厄瓜多": "ecuador", "厄瓜多尔": "ecuador",
  "奧地利": "austria", "奥地利": "austria",
  "澳洲": "australia", "澳大利亚": "australia",
  "加拿大": "canada", "挪威": "norway", "巴拿馬": "panama", "巴拿马": "panama",
  "埃及": "egypt", "巴拉圭": "paraguay", "突尼西亞": "tunisia", "突尼斯": "tunisia",
  "象牙海岸": "ivorycoast", "科特迪瓦": "ivorycoast",
  "瑞典": "sweden", "卡達": "qatar", "卡塔尔": "qatar", "伊拉克": "iraq",
  "沙烏地阿拉伯": "saudiarabia", "沙烏地": "saudiarabia", "沙特阿拉伯": "saudiarabia", "沙特": "saudiarabia",
  "南非": "southafrica", "迦納": "ghana", "加纳": "ghana", "紐西蘭": "newzealand", "新西兰": "newzealand",
  "蘇格蘭": "scotland", "苏格兰": "scotland", "海地": "haiti", "庫拉索": "curacao", "库拉索": "curacao",
  "維德角": "capeverde", "佛得角": "capeverde",
  "阿爾及利亞": "algeria", "阿尔及利亚": "algeria",
  "約旦": "jordan", "约旦": "jordan", "烏茲別克": "uzbekistan", "乌兹别克斯坦": "uzbekistan",
  "波士尼亞": "bosnia", "波黑": "bosnia", "捷克": "czechia",
  "土耳其": "turkey", "剛果": "drcongo", "刚果民主共和国": "drcongo",
  "牙買加": "jamaica", "牙买加": "jamaica", "蘇利南": "suriname", "苏里南": "suriname",
  "玻利維亞": "bolivia", "玻利维亚": "bolivia",
}

// 位置映射
function mapPosition(posStr: string): string {
  const p = posStr.toUpperCase().replace(/\s/g, "")
  if (p.includes("GK") || p.includes("門將") || p.includes("门将") || p.includes("守門員")) return "GK"
  if (p.includes("CB") || p.includes("中後衛") || p.includes("中后卫") || p.includes("中衛")) return "CB"
  if (p.includes("LB") || p.includes("左後衛") || p.includes("左后卫") || p.includes("左閘")) return "LB"
  if (p.includes("RB") || p.includes("右後衛") || p.includes("右后卫") || p.includes("右閘")) return "RB"
  if (p.includes("CDM") || p.includes("防守中場") || p.includes("后腰") || p.includes("後腰")) return "CDM"
  if (p.includes("CM") || p.includes("中場") || p.includes("中场") || p.includes("中前衛")) return "CM"
  if (p.includes("CAM") || p.includes("攻擊中場") || p.includes("前腰") || p.includes("进攻中场")) return "CAM"
  if (p.includes("LW") || p.includes("LM") || p.includes("左翼") || p.includes("左邊鋒") || p.includes("左边锋") || p.includes("左中場")) return "LW"
  if (p.includes("RW") || p.includes("RM") || p.includes("右翼") || p.includes("右邊鋒") || p.includes("右边锋") || p.includes("右中場")) return "RW"
  if (p.includes("ST") || p.includes("CF") || p.includes("前鋒") || p.includes("前锋") || p.includes("中鋒")) return "ST"
  if (p.includes("後衛") || p.includes("后卫") || p.includes("DF") || p.includes("衛")) return "CB"
  if (p.includes("翼")) return "LW"
  return "CM"
}

function parseHeight(_h?: string): number { return 178 }
function parseWeight(_w?: string): number { return 72 }
function mapFoot(_s?: string): "左" | "右" | "双" { return "右" }

function estimateMV(pos: string, age: number): number {
  const base: Record<string, number> = { GK: 8_000_000, CB: 20_000_000, LB: 15_000_000, RB: 15_000_000, CDM: 22_000_000, CM: 28_000_000, CAM: 32_000_000, LW: 35_000_000, RW: 35_000_000, ST: 40_000_000 }
  const b = base[pos] ?? 20_000_000
  if (age <= 21) return Math.round(b * 1.3)
  if (age <= 25) return Math.round(b * 1.0)
  if (age <= 29) return Math.round(b * 0.75)
  if (age <= 32) return Math.round(b * 0.35)
  return Math.round(b * 0.12)
}

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

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/** 从文本中提取 "球队名 ... 26人大名单" 来确定球队 */
function findTeamName(text: string): string | null {
  const patterns = [
    /(.{1,8})(?:2026\s*(?:世足賽|世界盃|世界杯|世足)\s*26\s*人(?:大名单|大名單))/,
    /(.{1,8})(?:2026\s*(?:世足賽|世界盃|世界杯|世足)\s*26\s*人)/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      let name = m[1].trim()
      // 清理尾部符号
      name = name.replace(/[）\)」】]$/, "").trim()
      if (name.length >= 1 && name.length <= 6) return name
    }
  }
  return null
}

/** 解析球员行: "位置 球员名（English Name） 俱乐部" */
function parsePlayerLine(line: string): { name: string; enName: string; club: string; position: string } | null {
  line = line.trim()
  if (!line || line.length < 5) return null

  // 跳过非球员行
  if (/^(位置|首頁|完整賽程|分組|台灣|追賽|WorldCup|延伸|本頁|人數|以下|門將|後衛|中場|前鋒|守門|總教練|隊長|教練|最大|本屆|陣中|這支|他們|資料|名單|首战|這份|合計|共\d|門將\d|後衛\d|中場\d|前鋒\d)/.test(line)) return null

  // 提取位置（开头）
  let position = "CM"
  const posMatch = line.match(/^(GK|CB|LB|RB|CDM|CM|CAM|LW|RW|ST|CF|LM|RM|DF|MF|FW|門將|门将|後衛|后卫|中場|中场|前鋒|前锋|守門員|左後衛|右後衛|中後衛|左閘|右閘|翼鋒|邊鋒|边锋|前腰|後腰|后腰|中鋒|中锋|攻擊中場|防守中場|左中場|右中場|左翼|右翼)\s+/i)
  if (posMatch) {
    position = mapPosition(posMatch[1])
    line = line.slice(posMatch[0].length).trim()
  }

  // 提取球员名和英文名: "中文名（English Name）" 或 "中文名 English Name"
  let name = ""
  let enName = ""

  const bracketMatch = line.match(/^(.+?)（(.+?)）/)
  if (bracketMatch) {
    name = bracketMatch[1].trim()
    enName = bracketMatch[2].trim()
    line = line.slice(bracketMatch[0].length).trim()
  } else {
    // 尝试 "中文名 EnglishName 俱乐部" 格式
    const nameMatch = line.match(/^([\u4e00-\u9fff·]{2,10})\s+([A-Za-z\s·\-]{3,40})(?:\s|$)/)
    if (nameMatch) {
      name = nameMatch[1].trim()
      enName = nameMatch[2].trim()
      line = line.slice(nameMatch[0].length).trim()
    } else {
      return null
    }
  }

  // 提取俱乐部（剩下的文本）
  let club = line
    .replace(/（[^）]*隊長[^）]*）/, "")
    .replace(/\([^)]*captain[^)]*\)/i, "")
    .replace(/\/隊長/, "")
    .replace(/—/, " ")
    .replace(/\s*（[^）]+）\s*$/, "")
    .trim()

  // 清理俱乐部名
  club = club.replace(/\s*\/\/.*$/, "").replace(/\s*\/\s*$/, "").trim()

  if (!name || !enName) return null
  if (name.length < 1 || enName.length < 2) return null
  if (/^(位置|首頁|完整|分組|台灣|追賽|人數|以下|門將|後衛|中場|前鋒|守門)/.test(name)) return null

  return { name, enName, club: club || "未知", position }
}

async function fetchPage(pageNum: number): Promise<string> {
  const url = pageNum === 1
    ? "https://www.worldcupfifa.com.tw/blog/categories/qiuyuan"
    : `${BASE}/${pageNum}`
  console.log(`  获取第 ${pageNum} 页...`)
  const res = await fetch(url)
  return res.text()
}

function parsePage(html: string): { teamName: string; teamId: string | null; players: any[] }[] {
  const results: { teamName: string; teamId: string | null; players: any[] }[] = []

  // 按文章分割 —— 每个 "2026 世足賽" 或 "2026 世界盃" 开头的块
  const articles = html.split(/\n(?=(?:.{1,8})(?:2026\s*(?:世足賽|世界盃|世界杯|世足)\s*26\s*人))/)

  for (const article of articles) {
    if (article.length < 500) continue

    const teamName = findTeamName(article)
    if (!teamName) continue

    const teamId = TEAM_NAME_MAP[teamName] || null
    if (!teamId) {
      console.log(`    ⚠ 未映射: "${teamName}"`)
      continue
    }

    // 解析每行球员数据
    const lines = article.split("\n")
    const players: any[] = []
    for (const line of lines) {
      const player = parsePlayerLine(line)
      if (player) {
        players.push(player)
      }
    }

    if (players.length >= 10) {
      console.log(`    ✅ ${teamName} → ${teamId}: ${players.length} 人`)
      results.push({ teamName, teamId, players })
    } else {
      console.log(`    ⚠ ${teamName}: 仅 ${players.length} 人，跳过`)
    }
  }

  return results
}

function buildPlayerObj(p: any, idx: number, usedIds: Set<string>): any {
  const pos = p.position
  const age = 26
  const mv = estimateMV(pos, age)
  let base = p.enName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 20) || `p${Date.now()}`
  let id = base; let s = 1
  while (usedIds.has(id)) { id = `${base}${s}`; s++ }
  usedIds.add(id)

  return {
    id, name: p.name, number: idx + 1, position: pos,
    club: p.club, age, height: 178, weight: 72,
    nationality: "", flagCode: "", preferredFoot: "右" as const,
    birthDate: "", marketValue: mv, photoUrl: "",
    abilities: estAbilities(pos, mv, age),
    tournamentStats: { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 0 },
    careerSummary: { firstAppearance: "", totalCaps: 0, totalGoals: 0, majorTournaments: [], clubs: [{ clubName: p.club, period: "至今", appearances: 0, goals: 0 }] },
  }
}

async function main() {
  console.log("开始抓取 worldcupfifa.com.tw 球员数据...\n")

  const allResults: { teamName: string; teamId: string; players: any[] }[] = []

  for (let p = 1; p <= TOTAL_PAGES; p++) {
    const html = await fetchPage(p)
    const results = parsePage(html)
    allResults.push(...results)
    if (p < TOTAL_PAGES) await sleep(1500)
  }

  console.log(`\n共解析 ${allResults.length} 支球队\n`)

  // 读取 teams.ts
  let content = fs.readFileSync(TEAMS_PATH, "utf-8")

  let totalNew = 0
  for (const { teamId, players } of allResults) {
    if (players.length === 0) continue

    // 找到该球队
    const startMarker = `"id": "${teamId}"`
    const teamStart = content.indexOf(startMarker)
    if (teamStart === -1) { console.log(`  ❌ 未找到 ${teamId}`); continue }

    const playersKey = content.indexOf('"players": [', teamStart)
    if (playersKey === -1) { console.log(`  ❌ players 定位失败 ${teamId}`); continue }

    const pStart = playersKey + '"players": ['.length
    let depth = 1, pEnd = pStart, inStr = false, esc = false
    for (let j = pStart; j < content.length; j++) {
      const ch = content[j]
      if (esc) { esc = false; continue }
      if (ch === "\\") { esc = true; continue }
      if (ch === '"') { inStr = !inStr; continue }
      if (inStr) continue
      if (ch === "[") depth++
      else if (ch === "]") { depth--; if (depth === 0) { pEnd = j; break } }
    }

    // 保留原有球员
    const existing = content.slice(pStart, pEnd).trim()
    const existingParts = existing ? existing.split(/\n(?=\s*\{)/).filter(s => s.trim()) : []

    const before = content.slice(Math.max(0, playersKey - 60), playersKey)
    const indentMatch = before.match(/\n(\s+)$/)
    const baseIndent = indentMatch?.[1] || "      "
    const itemIndent = baseIndent + "  "

    const usedIds = new Set<string>()
    const newPlayers = players.map((p, i) => buildPlayerObj(p, i, usedIds))

    // 合并：保留原有 + 追加新（去重）
    const existingIds = new Set(existingParts.map(s => {
      const m = s.match(/"id":\s*"([^"]+)"/)
      return m ? m[1] : ""
    }))
    const merged = [...existingParts]

    for (const np of newPlayers) {
      if (!existingIds.has(np.id) && merged.length < 26) {
        existingIds.add(np.id)
        const json = JSON.stringify(np, null, 2)
        merged.push(json.split("\n").map((l, i) => i === 0 ? itemIndent + l : itemIndent + l).join("\n"))
      }
    }

    const newBlock = merged.length > 0 ? "\n" + merged.join(",\n") + "\n" + baseIndent : ""
    content = content.slice(0, pStart) + newBlock + content.slice(pEnd)

    console.log(`  ${teamId}: ${players.length} 新 → 共 ${merged.length} 人`)
    totalNew += players.length
  }

  fs.writeFileSync(TEAMS_PATH, content, "utf-8")

  const totalClubs = (content.match(/"club":/g) || []).length
  console.log(`\n完成！新增 ${totalNew} 名球员，总计 ${totalClubs} 名`)
  console.log("运行 npx tsc --noEmit 验证编译...")
}

main().catch(console.error)
