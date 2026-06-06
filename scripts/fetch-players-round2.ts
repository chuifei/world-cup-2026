/**
 * 第二轮：用别名搜索 thesportsdb，补充第一轮未成功的球队。
 * 用法: npx tsx scripts/fetch-players-round2.ts
 */
import * as fs from "fs"
import * as path from "path"

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3"
const TEAMS_PATH = path.resolve("src/data/teams.ts")

// 第一轮成功的球队 ID
const ROUND1_SUCCESS = new Set([
  "spain","argentina","france","england","brazil","portugal","netherlands",
  "belgium","germany","croatia","morocco","colombia","mexico","uruguay",
  "switzerland","japan","senegal"
])

// nameEn → thesportsdb 搜索词（针对搜不到的球队）
const NAME_FALLBACK: Record<string, string> = {
  "United States": "USA",
  "South Korea": "Korea Republic",
  "Ivory Coast": "Ivory Coast",
  "DR Congo": "DR Congo",
  "Bosnia and Herzegovina": "Bosnia",
  "Czechia": "Czech Republic",
  "Turkey": "Turkey",
  "Saudi Arabia": "Saudi Arabia",
  "South Africa": "South Africa",
  "New Zealand": "New Zealand",
  "Cape Verde": "Cape Verde",
  "Curacao": "Curacao",
  "Haiti": "Haiti",
  "Jordan": "Jordan",
  "Uzbekistan": "Uzbekistan",
  "Jamaica": "Jamaica",
  "Suriname": "Suriname",
  "Bolivia": "Bolivia",
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
}

function parseHeight(h: string | undefined): number {
  if (!h) return 178
  const m = h.match(/([\d.]+)\s*m/) ?? h.match(/(\d+)\s*cm/)
  if (m) return Math.round(parseFloat(m[1]) * (h.includes("m") && !h.includes("cm") ? 100 : 1))
  const fi = h.match(/(\d+)\s*ft\s*(\d+)/)
  if (fi) return Math.round(parseInt(fi[1]) * 30.48 + parseInt(fi[2]) * 2.54)
  return 178
}
function parseWeight(w: string | undefined): number {
  if (!w) return 72
  const kg = w.match(/(\d+)\s*[Kk]g/)
  if (kg) return parseInt(kg[1])
  const lbs = w.match(/(\d+)\s*lbs/)
  if (lbs) return Math.round(parseInt(lbs[1]) * 0.4536)
  return 72
}
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
function mapFoot(side: string | undefined): "左" | "右" | "双" {
  if (!side) return "右"
  const s = side.toLowerCase()
  if (s === "left") return "左"
  if (s === "right") return "右"
  return "右"
}
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
function calcAge(birth: string | undefined): number {
  if (!birth) return 26
  const b = new Date(birth)
  const ref = new Date("2026-06-01")
  let age = ref.getFullYear() - b.getFullYear()
  if (ref.getMonth() < b.getMonth() || (ref.getMonth() === b.getMonth() && ref.getDate() < b.getDate())) age--
  return Math.max(17, age)
}

interface TSDBPlayer {
  idPlayer: string; strPlayer: string; strTeam: string;
  strPosition: string; strNumber: string; dateBorn: string;
  strHeight: string; strWeight: string; strThumb: string; strCutout: string; strSide: string;
}
interface TSDBTeam { idTeam: string; strTeam: string; strLeague: string }

async function findTeam(searchName: string): Promise<string | null> {
  const url = `${API_BASE}/searchteams.php?t=${encodeURIComponent(searchName)}`
  const res = await fetchJson<{ teams: TSDBTeam[] | null }>(url)
  if (!res?.teams) return null
  const national = res.teams.find(t => t.strLeague === "FIFA World Cup")
  return national?.idTeam ?? null
}

async function getPlayers(teamId: string): Promise<TSDBPlayer[]> {
  const url = `${API_BASE}/lookup_all_players.php?id=${teamId}`
  const res = await fetchJson<{ player: TSDBPlayer[] | null }>(url)
  return res?.player ?? []
}

function buildPlayer(p: TSDBPlayer, usedIds: Set<string>): any {
  const pos = mapPosition(p.strPosition)
  const age = calcAge(p.dateBorn)
  const mv = estimateMV(pos, age)
  let base = p.strPlayer.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,20)||`p${Date.now()}`
  let id = base; let s = 1
  while (usedIds.has(id)) { id = `${base}${s}`; s++ }
  usedIds.add(id)
  return {
    id, name: p.strPlayer,
    number: parseInt(p.strNumber) || 0,
    position: pos, club: p.strTeam || "", age,
    height: parseHeight(p.strHeight), weight: parseWeight(p.strWeight),
    nationality: "", flagCode: "",
    preferredFoot: mapFoot(p.strSide),
    birthDate: p.dateBorn || "", marketValue: mv,
    photoUrl: p.strCutout || p.strThumb || "",
    abilities: estAbilities(pos, mv, age),
    tournamentStats: { appearances:0,goals:0,assists:0,yellowCards:0,redCards:0,minutesPlayed:0,averageRating:0 },
    careerSummary: { firstAppearance:"",totalCaps:0,totalGoals:0,majorTournaments:[],clubs:[{clubName:p.strTeam||"",period:"至今",appearances:0,goals:0}] },
  }
}

async function main() {
  let content = fs.readFileSync(TEAMS_PATH, "utf-8")
  const teamRegex = /\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"nameEn":\s*"([^"]+)"/g
  const teamList: { id: string; name: string; nameEn: string }[] = []
  let m: RegExpExecArray | null
  while ((m = teamRegex.exec(content)) !== null) {
    if (!ROUND1_SUCCESS.has(m[1])) teamList.push({ id: m[1], name: m[2], nameEn: m[3] })
  }

  console.log(`第二轮：${teamList.length} 支球队\n`)
  let totalNew = 0
  let successCount = 0

  for (let i = 0; i < teamList.length; i++) {
    const team = teamList[i]
    const searchName = NAME_FALLBACK[team.nameEn] || team.nameEn
    process.stdout.write(`[${i+1}/${teamList.length}] ${team.name} (搜: ${searchName})... `)

    const tsdbId = await findTeam(searchName)
    if (!tsdbId) { console.log("❌"); await sleep(2000); continue }

    const players = await getPlayers(tsdbId)
    if (players.length === 0) { console.log("❌ 无球员"); await sleep(2000); continue }

    const usedIds = new Set<string>()
    const newPlayers = players.filter(p=>p.strPosition).slice(0,26).map(p=>buildPlayer(p,usedIds))

    // 定位并替换 players 数组
    const startMarker = `"id": "${team.id}"`
    const teamStart = content.indexOf(startMarker)
    if (teamStart === -1) { console.log("❌ 定位失败"); await sleep(2000); continue }

    const playersKey = content.indexOf('"players": [', teamStart)
    if (playersKey === -1) { console.log("❌ players 定位失败"); await sleep(2000); continue }

    const pStart = playersKey + '"players": ['.length
    let depth=1, pEnd=pStart, inStr=false, esc=false
    for (let j=pStart; j<content.length; j++) {
      const ch=content[j]
      if(esc){esc=false;continue}
      if(ch==="\\"){esc=true;continue}
      if(ch==='"'){inStr=!inStr;continue}
      if(inStr)continue
      if(ch==="[")depth++
      else if(ch==="]"){depth--;if(depth===0){pEnd=j;break}}
    }

    // 保持原有球员
    const existing = content.slice(pStart, pEnd).trim()
    const existingParts = existing ? existing.split(/\n(?=\s*\{)/).filter(s=>s.trim()) : []

    const before = content.slice(Math.max(0,playersKey-60), playersKey)
    const indentMatch = before.match(/\n(\s+)$/)
    const baseIndent = indentMatch?.[1] || "      "
    const itemIndent = baseIndent + "  "

    const merged = [...existingParts]
    for (const np of newPlayers) {
      if (merged.length >= 23) break
      const json = JSON.stringify(np,null,2)
      merged.push(json.split("\n").map((l,i)=>i===0?itemIndent+l:itemIndent+l).join("\n"))
    }

    const newBlock = merged.length>0 ? "\n"+merged.join(",\n")+"\n"+baseIndent : ""
    content = content.slice(0,pStart) + newBlock + content.slice(pEnd)

    console.log(`✅ ${newPlayers.length} 人 (总计 ${merged.length})`)
    totalNew += newPlayers.length
    successCount++
    await sleep(2500)
  }

  fs.writeFileSync(TEAMS_PATH, content, "utf-8")
  console.log(`\n第二轮完成！${successCount}/${teamList.length} 队成功，新增 ${totalNew} 名球员`)

  // 统计总数
  const clubs = (content.match(/"club":/g)||[]).length
  console.log(`总球员数: ${clubs}`)
}

main().catch(console.error)
