/**
 * 合并脚本：将 fetched-players.json 中的球员数据注入 teams.ts。
 * 用法: npx tsx scripts/merge-players.ts
 */
import * as fs from "fs"
import * as path from "path"

const TEAMS_PATH = path.resolve("src/data/teams.ts")
const PLAYERS_PATH = path.resolve("scripts/fetched-players.json")

function main() {
  if (!fs.existsSync(PLAYERS_PATH)) {
    console.error("请先运行 fetch-players.ts 获取球员数据")
    process.exit(1)
  }

  const allTeamPlayers: Record<string, any[]> = JSON.parse(
    fs.readFileSync(PLAYERS_PATH, "utf-8")
  )

  let content = fs.readFileSync(TEAMS_PATH, "utf-8")
  let totalAdded = 0

  for (const [teamId, players] of Object.entries(allTeamPlayers)) {
    if (players.length === 0) continue

    // 找到该球队的 "players": [ 数组
    // 策略：找到 team id，然后找到其 players 数组的结束 ]
    const teamIdPattern = new RegExp(
      `"id":\\s*"${teamId}"[\\s\\S]*?"players":\\s*\\[`,
      "m"
    )
    const match = content.match(teamIdPattern)
    if (!match) {
      console.warn(`  未找到球队 ${teamId}`)
      continue
    }

    // 找到 players 数组的起始位置
    const playersStart = match.index! + match[0].length

    // 需要找到匹配的 ] （考虑嵌套）
    let depth = 1
    let playersEnd = playersStart
    let inString = false
    let escape = false
    for (let i = playersStart; i < content.length; i++) {
      const ch = content[i]
      if (escape) { escape = false; continue }
      if (ch === "\\") { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === "[") depth++
      else if (ch === "]") {
        depth--
        if (depth === 0) {
          playersEnd = i
          break
        }
      }
    }

    // 获取现有球员
    const existingPlayersStr = content.slice(playersStart, playersEnd).trim()
    const hasExistingPlayers = existingPlayersStr.length > 0

    // 生成新球员 JSON（需要保持缩进一致）
    // 先找到缩进级别
    const indentMatch = content.slice(Math.max(0, playersStart - 100), playersStart).match(/\n(\s+)$/)
    const baseIndent = indentMatch ? indentMatch[1] : "      "
    const playerIndent = baseIndent + "  "

    const playerJsons = players.map((p: any) => {
      return JSON.stringify(p, null, 2)
        .split("\n")
        .map((line, i) => i === 0 ? playerIndent + line : playerIndent + line)
        .join("\n")
    })

    // 构建新的 players 数组内容
    const existingPlayers = hasExistingPlayers
      ? existingPlayersStr.split(/\n(?=\s*\{)/).filter((s) => s.trim())
      : []

    // 如果已有 3+ 个球员，保留前几个，追加新的
    // 策略：保留原有球员，追加新的（去重基于 id）
    const existingIds = new Set<string>()
    const allPlayers = [...existingPlayers]

    // 添加新球员（跳过已存在的 id）
    for (const p of players) {
      if (!existingIds.has(p.id)) {
        existingIds.add(p.id)
        allPlayers.push(JSON.stringify(p, null, 2).replace(/^/gm, playerIndent).replace(/^\s+/, ""))
      }
    }

    // 去重并限制 26 人
    const finalPlayers = allPlayers.slice(0, 26)
    const newPlayersBlock = finalPlayers.length > 0
      ? "\n" + finalPlayers.map((s) => {
          // 确保缩进正确
          return playerIndent + s.trim().replace(/\n/g, "\n" + playerIndent)
        }).join(",\n") + "\n" + baseIndent
      : ""

    // 替换
    content = content.slice(0, playersStart) + newPlayersBlock + content.slice(playersEnd)
    totalAdded += players.length
    console.log(`  ${teamId}: ${players.length} 名球员`)
  }

  fs.writeFileSync(TEAMS_PATH, content, "utf-8")
  console.log(`\n完成！共更新球员数据。`)
  console.log(`请运行 npx tsc --noEmit 验证编译。`)
}

main()
