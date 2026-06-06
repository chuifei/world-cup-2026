/**
 * 读取 scripts/squads/*.json → 合并到 src/data/teams.ts
 * 用法: node scripts/merge-squads.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { resolve } from "path"

const SQUADS_DIR = resolve("scripts/squads")
const TEAMS_PATH = resolve("src/data/teams.ts")

const MV = { GK:8e6, CB:20e6, LB:15e6, RB:15e6, CDM:22e6, CM:28e6, CAM:32e6, LW:35e6, RW:35e6, ST:40e6 }
function ab(pos, mv) {
  const f = Math.min(mv/50e6, 1.4)
  const r = (l,h) => Math.min(99, Math.round(l+(h-l)*f))
  const m = {
    GK:{sh:20,pa:55,dr:45,sp:50,de:r(68,90),ph:r(62,85)},
    CB:{sh:r(30,50),pa:r(50,75),dr:r(38,62),sp:r(48,72),de:r(70,90),ph:r(68,88)},
    LB:{sh:r(35,55),pa:r(58,80),dr:r(52,78),sp:r(68,90),de:r(58,82),ph:r(52,75)},
    RB:{sh:r(35,55),pa:r(58,80),dr:r(52,78),sp:r(68,90),de:r(58,82),ph:r(52,75)},
    CDM:{sh:r(42,65),pa:r(62,82),dr:r(48,70),sp:r(48,70),de:r(68,88),ph:r(70,88)},
    CM:{sh:r(52,75),pa:r(70,90),dr:r(58,80),sp:r(52,75),de:r(48,70),ph:r(58,78)},
    CAM:{sh:r(58,80),pa:r(70,90),dr:r(68,90),sp:r(58,78),de:r(28,48),ph:r(48,70)},
    LW:{sh:r(58,78),pa:r(62,82),dr:r(72,93),sp:r(75,93),de:r(22,42),ph:r(48,70)},
    RW:{sh:r(58,78),pa:r(62,82),dr:r(72,93),sp:r(75,93),de:r(22,42),ph:r(48,70)},
    ST:{sh:r(72,92),pa:r(52,75),dr:r(62,85),sp:r(65,88),de:r(18,35),ph:r(58,80)},
  }
  return m[pos] ?? m.CM
}

function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function buildPlayer(p, idx, usedIds) {
  const pos = p.position || "CM"
  const mv = MV[pos] ?? 20e6
  let base = (p.enName||"").toLowerCase().replace(/[^a-z]/g,"").slice(0,20) || `p${Date.now()}`
  let id = base, s = 1
  while (usedIds.has(id)) { id = `${base}${s}`; s++ }
  usedIds.add(id)
  const abi = ab(pos, mv)

  // 估算年龄/身高/体重
  const age = pos==='GK'?rand(25,37):pos==='ST'?rand(19,33):rand(20,34)
  const h = pos==='GK'?rand(185,200):pos==='CB'?rand(182,196):pos==='ST'?rand(172,192):rand(168,188)
  const w = pos==='GK'?rand(78,95):pos==='CB'?rand(75,92):pos==='ST'?rand(65,88):rand(60,82)
  const foot = Math.random()>0.7?"左":"右"

  // 估算职业生涯
  const caps = Math.floor(age*1.5 + rand(-10,40))
  const goals = pos==='ST'?Math.floor(caps*0.45):pos==='LW'||pos==='RW'?Math.floor(caps*0.2):pos==='CAM'?Math.floor(caps*0.15):Math.floor(caps*0.05)
  const debutYear = 2026 - age + rand(17,22)
  const tournaments = []
  if(age>=30) tournaments.push("2022世界杯")
  if(age>=27) tournaments.push("2024欧洲杯","2024美洲杯")
  if(age>=24) tournaments.push("2024欧洲杯")

  return {
    id, name: p.name, number: idx+1, position: pos,
    club: p.club||"未知", age, height: h, weight: w,
    nationality: "", flagCode: "", preferredFoot: foot,
    birthDate: `${2026-age}-${String(rand(1,12)).padStart(2,'0')}-${String(rand(1,28)).padStart(2,'0')}`,
    marketValue: mv, photoUrl: "",
    abilities: { shooting:abi.sh, passing:abi.pa, dribbling:abi.dr, speed:abi.sp, defense:abi.de, physical:abi.ph },
    tournamentStats: { appearances:0,goals:0,assists:0,yellowCards:0,redCards:0,minutesPlayed:0,averageRating:0 },
    careerSummary: {
      firstAppearance: `${debutYear}-01-01`,
      totalCaps: caps,
      totalGoals: goals,
      majorTournaments: tournaments,
      clubs: [{clubName:p.club||"未知",period:`${debutYear}-至今`,appearances:rand(20,300),goals:goals}],
    },
  }
}

let content = readFileSync(TEAMS_PATH, "utf-8")
const files = readdirSync(SQUADS_DIR).filter(f => f.endsWith(".json"))
let totalNew = 0

for (const file of files) {
  const teamId = file.replace(".json","")
  const players = JSON.parse(readFileSync(resolve(SQUADS_DIR, file), "utf-8"))
  if (!players.length) continue

  // 用更精确的匹配——team 有 "nameEn" 紧跟在后面
  const escapedId = teamId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const teamRe = new RegExp(`"id":\\s*"${escapedId}"[^}]*"nameEn"`, "g")
  const teamMatch = teamRe.exec(content)
  if (!teamMatch) { console.log(`  ❌ 未找到 ${teamId}`); continue }
  const teamStart = teamMatch.index

  const playersKey = content.indexOf('"players": [', teamStart)
  if (playersKey === -1) continue

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

  const before = content.slice(Math.max(0, playersKey-60), playersKey)
  const im = before.match(/\n(\s+)$/)
  const bi = im?.[1] || "      "
  const ii = bi + "  "

  const usedIds = new Set()
  const pjs = players.map((p, i) => {
    const obj = buildPlayer(p, i, usedIds)
    const json = JSON.stringify(obj, null, 2)
    return json.split("\n").map((l, i) => i===0 ? ii+l : ii+l).join("\n")
  })

  const newBlock = "\n" + pjs.join(",\n") + "\n" + bi
  content = content.slice(0, pStart) + newBlock + content.slice(pEnd)
  totalNew += players.length
  console.log(`  ${teamId}: ${players.length} 人`)
}

writeFileSync(TEAMS_PATH, content, "utf-8")
const clubs = (content.match(/"club":/g)||[]).length
console.log(`\n总计 ${clubs} 名球员`)
console.log("运行 npx tsc --noEmit 验证...")
