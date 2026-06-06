/**
 * 解析 worldcupfifa.com.tw 页面文本，提取球队球员数据
 * 用法: 
 *   1. 先用 web_fetch 工具抓取各页面文本，保存到 scripts/wcf-pages/
 *   2. 再运行: npx tsx scripts/parse-wcf.ts
 */
import * as fs from "fs"
import * as path from "path"

const PAGES_DIR = path.resolve("scripts/wcf-pages")
const TEAMS_PATH = path.resolve("src/data/teams.ts")

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
  "厄瓜多": "ecuador", "厄瓜多尔": "ecuador", "奧地利": "austria", "奥地利": "austria",
  "澳洲": "australia", "澳大利亚": "australia", "加拿大": "canada",
  "挪威": "norway", "巴拿馬": "panama", "巴拿马": "panama",
  "埃及": "egypt", "巴拉圭": "paraguay", "突尼西亞": "tunisia", "突尼斯": "tunisia",
  "象牙海岸": "ivorycoast", "科特迪瓦": "ivorycoast",
  "瑞典": "sweden", "卡達": "qatar", "卡塔尔": "qatar", "伊拉克": "iraq",
  "沙烏地阿拉伯": "saudiarabia", "沙烏地": "saudiarabia", "沙特阿拉伯": "saudiarabia", "沙特": "saudiarabia",
  "南非": "southafrica", "迦納": "ghana", "加纳": "ghana",
  "紐西蘭": "newzealand", "新西兰": "newzealand",
  "蘇格蘭": "scotland", "苏格兰": "scotland", "海地": "haiti",
  "庫拉索": "curacao", "库拉索": "curacao", "維德角": "capeverde", "佛得角": "capeverde",
  "阿爾及利亞": "algeria", "阿尔及利亚": "algeria",
  "約旦": "jordan", "约旦": "jordan", "烏茲別克": "uzbekistan", "乌兹别克斯坦": "uzbekistan",
  "波士尼亞": "bosnia", "波士尼亞赫塞哥維納": "bosnia", "波黑": "bosnia",
  "捷克": "czechia", "土耳其": "turkey",
  "剛果民主共和國": "drcongo", "剛果": "drcongo", "刚果民主共和国": "drcongo",
  "牙買加": "jamaica", "牙买加": "jamaica", "蘇利南": "suriname", "苏里南": "suriname",
  "玻利維亞": "bolivia", "玻利维亚": "bolivia",
  "英格": "england",
}

function mapPosition(posStr: string): string {
  const p = posStr.toUpperCase().replace(/\s/g, "")
  if (/^(GK|門將|门将|守門員)$/.test(p)) return "GK"
  if (/^(CB|中後衛|中后卫|中衛)$/.test(p)) return "CB"
  if (/^(LB|左後衛|左后卫|左閘)$/.test(p)) return "LB"
  if (/^(RB|右後衛|右后卫|右閘)$/.test(p)) return "RB"
  if (/^(CDM|防守中場|后腰|後腰)$/.test(p)) return "CDM"
  if (/^(CM|中場|中场|中前衛)$/.test(p)) return "CM"
  if (/^(CAM|攻擊中場|前腰|进攻中场)$/.test(p)) return "CAM"
  if (/^(LW|LM|左翼|左邊鋒|左边锋|左中場)$/.test(p)) return "LW"
  if (/^(RW|RM|右翼|右邊鋒|右边锋|右中場)$/.test(p)) return "RW"
  if (/^(ST|CF|前鋒|前锋|中鋒|中锋)$/.test(p)) return "ST"
  if (/^(後衛|后卫|DF|衛)$/.test(p)) return "CB"
  if (/^(MF|中場|中场)$/.test(p)) return "CM"
  if (/^(FW|前鋒|前锋)$/.test(p)) return "ST"
  return "CM"
}

function findTeamName(text: string): string | null {
  const m = text.match(/(.{1,8})(?:2026\s*(?:世足賽|世界盃|世界杯|世足)\s*26\s*人(?:大名單|大名单|大名))/)
  if (m) {
    let name = m[1].trim().replace(/[）\)」】]$/, "").trim()
    if (name.length >= 1 && name.length <= 8 && /[\u4e00-\u9fff]/.test(name)) return name
  }
  return null
}

function parsePlayerLine(line: string): { name: string; enName: string; club: string; position: string } | null {
  line = line.trim()
  if (!line || line.length < 5) return null
  
  // Skip metadata lines
  if (/^(位置|首頁|完整|分組|台灣|追賽|人數|以下|門將|後衛|中場|前鋒|守門|總教練|教練|最大|陣中|這支|他們|資料|名單|首战|這份|合計|共\d|WorldCup|延伸|本頁|想先|快速|本屆)/.test(line)) return null

  // Extract position
  let position = "CM"
  const posMatch = line.match(/^(GK|CB|LB|RB|CDM|CM|CAM|LW|RW|ST|CF|LM|RM|DF|MF|FW|門將|门将|後衛|后卫|中場|中场|前鋒|前锋|守門員|左後衛|右後衛|中後衛|左閘|右閘|翼鋒|邊鋒|边锋|前腰|後腰|后腰|中鋒|中锋|攻擊中場|防守中場|左中場|右中場|左翼|右翼|DEF|MID)\s+/i)
  if (posMatch) {
    position = mapPosition(posMatch[1])
    line = line.slice(posMatch[0].length).trim()
  }

  // Extract player name and English name
  const bracketMatch = line.match(/^(.+?)（(.+?)）/)
  let name = "", enName = ""
  if (bracketMatch) {
    name = bracketMatch[1].trim()
    enName = bracketMatch[2].trim()
    line = line.slice(bracketMatch[0].length).trim()
  } else {
    const nameMatch = line.match(/^([\u4e00-\u9fff·]{2,12})\s+([A-Za-z\s·\-]{3,40})(?:\s|$)/)
    if (nameMatch) {
      name = nameMatch[1].trim()
      enName = nameMatch[2].trim()
      line = line.slice(nameMatch[0].length).trim()
    } else {
      return null
    }
  }

  // Clean up
  if (/^(位置|首頁|完整|分組|人數|以下|門將|後衛|中場|前鋒)/.test(name)) return null
  if (name.length < 1 || enName.length < 2) return null

  // Extract club
  let club = line
    .replace(/（[^）]*隊長[^）]*）/, "")
    .replace(/\([^)]*captain[^)]*\)/i, "")
    .replace(/\/隊長/, "")
    .trim()
    .replace(/\s*\/\/.*$/, "")

  if (!club || club.length < 2) club = "未知"

  return { name, enName, club, position }
}

function estimateMV(pos: string): number {
  const base: Record<string, number> = { GK: 8e6, CB: 20e6, LB: 15e6, RB: 15e6, CDM: 22e6, CM: 28e6, CAM: 32e6, LW: 35e6, RW: 35e6, ST: 40e6 }
  return base[pos] ?? 20e6
}

function estAbilities(pos: string, mv: number) {
  const f = Math.min(mv / 50e6, 1.4)
  const r = (lo: number, hi: number) => Math.min(99, Math.round(lo + (hi - lo) * f))
  const map: Record<string, any> = {
    GK: { shooting: 20, passing: 55, dribbling: 45, speed: 50, defense: r(68, 90), physical: r(62, 85) },
    CB: { shooting: r(30, 50), passing: r(50, 75), dribbling: r(38, 62), speed: r(48, 72), defense: r(70, 90), physical: r(68, 88) },
    LB: { shooting: r(35, 55), passing: r(58, 80), dribbling: r(52, 78), speed: r(68, 90), defense: r(58, 82), physical: r(52, 75) },
    RB: { shooting: r(35, 55), passing: r(58, 80), dribbling: r(52, 78), speed: r(68, 90), defense: r(58, 82), physical: r(52, 75) },
    CDM: { shooting: r(42, 65), passing: r(62, 82), dribbling: r(48, 70), speed: r(48, 70), defense: r(68, 88), physical: r(70, 88) },
    CM: { shooting: r(52, 75), passing: r(70, 90), dribbling: r(58, 80), speed: r(52, 75), defense: r(48, 70), physical: r(58, 78) },
    CAM: { shooting: r(58, 80), passing: r(70, 90), dribbling: r(68, 90), speed: r(58, 78), defense: r(28, 48), physical: r(48, 70) },
    LW: { shooting: r(58, 78), passing: r(62, 82), dribbling: r(72, 93), speed: r(75, 93), defense: r(22, 42), physical: r(48, 70) },
    RW: { shooting: r(58, 78), passing: r(62, 82), dribbling: r(72, 93), speed: r(75, 93), defense: r(22, 42), physical: r(48, 70) },
    ST: { shooting: r(72, 92), passing: r(52, 75), dribbling: r(62, 85), speed: r(65, 88), defense: r(18, 35), physical: r(58, 80) },
  }
  return map[pos] ?? map["CM"]
}

function buildPlayer(p: any, idx: number, usedIds: Set<string>): any {
  const pos = p.position
  const mv = estimateMV(pos)
  let base = p.enName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 20) || `p${Date.now()}`
  let id = base; let s = 1
  while (usedIds.has(id)) { id = `${base}${s}`; s++ }
  usedIds.add(id)
  return {
    id, name: p.name, number: idx + 1, position: pos,
    club: p.club, age: 26, height: 178, weight: 72,
    nationality: "", flagCode: "", preferredFoot: "右",
    birthDate: "", marketValue: mv, photoUrl: "",
    abilities: estAbilities(pos, mv),
    tournamentStats: { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 0 },
    careerSummary: { firstAppearance: "", totalCaps: 0, totalGoals: 0, majorTournaments: [], clubs: [{ clubName: p.club, period: "至今", appearances: 0, goals: 0 }] },
  }
}

function main() {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`请先创建 ${PAGES_DIR} 目录，并将 web_fetch 抓取的页面文本保存为 page-1.txt ~ page-7.txt`)
    process.exit(1)
  }

  let content = fs.readFileSync(TEAMS_PATH, "utf-8")
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith(".txt")).sort()
  console.log(`找到 ${files.length} 个页面文件\n`)

  let totalNew = 0
  for (const file of files) {
    const text = fs.readFileSync(path.join(PAGES_DIR, file), "utf-8")
    console.log(`处理 ${file}...`)

    // Split by articles
    const articles = text.split(/\n(?=(?:.{1,10})(?:2026\s*(?:世足賽|世界盃|世界杯|世足)\s*26\s*人))/)
    
    for (const article of articles) {
      if (article.length < 500) continue
      const teamName = findTeamName(article)
      if (!teamName) continue
      const teamId = TEAM_NAME_MAP[teamName]
      if (!teamId) { console.log(`  ⚠ 未映射: "${teamName}"`); continue }

      const lines = article.split("\n")
      const players: any[] = []
      for (const line of lines) {
        const p = parsePlayerLine(line)
        if (p) players.push(p)
      }

      if (players.length < 10) { console.log(`  ⚠ ${teamName}: ${players.length} 人跳过`); continue }

      // Replace in teams.ts
      const startMarker = `"id": "${teamId}"`
      const teamStart = content.indexOf(startMarker)
      if (teamStart === -1) { console.log(`  ❌ 文件中未找到 ${teamId}`); continue }

      const playersKey = content.indexOf('"players": [', teamStart)
      if (playersKey === -1) continue
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

      const existing = content.slice(pStart, pEnd).trim()
      const existingParts = existing ? existing.split(/\n(?=\s*\{)/).filter(s => s.trim()) : []
      const before = content.slice(Math.max(0, playersKey - 60), playersKey)
      const indentMatch = before.match(/\n(\s+)$/)
      const baseIndent = indentMatch?.[1] || "      "
      const itemIndent = baseIndent + "  "

      const existingIds = new Set(existingParts.map(s => { const m = s.match(/"id":\s*"([^"]+)"/); return m ? m[1] : "" }))
      const usedIds = new Set<string>()
      const merged = [...existingParts]
      for (const p of players) {
        const obj = buildPlayer(p, merged.length, usedIds)
        if (!existingIds.has(obj.id) && merged.length < 26) {
          existingIds.add(obj.id)
          const json = JSON.stringify(obj, null, 2)
          merged.push(json.split("\n").map((l, i) => i === 0 ? itemIndent + l : itemIndent + l).join("\n"))
        }
      }

      const newBlock = merged.length > 0 ? "\n" + merged.join(",\n") + "\n" + baseIndent : ""
      content = content.slice(0, pStart) + newBlock + content.slice(pEnd)

      console.log(`  ✅ ${teamName} → ${teamId}: ${players.length} 新 → 共 ${merged.length}`)
      totalNew += players.length
    }
  }

  fs.writeFileSync(TEAMS_PATH, content, "utf-8")
  const clubs = (content.match(/"club":/g) || []).length
  console.log(`\n完成！新增 ${totalNew} 人，总计 ${clubs} 名球员`)
}

main()
