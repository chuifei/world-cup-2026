import type { GroupStandings } from '../types/standing'

/**
 * 2026 世界杯小组赛积分榜
 *
 * 基于2025年12月5日官方抽签结果。
 * 12个小组（A-L），每组4队，全部积分初始为0。
 * 数据状态：pending（待比赛开始后更新）
 */

const groups = {
  A: ['mexico', 'southkorea', 'southafrica', 'playoff-d'],
  B: ['canada', 'switzerland', 'qatar', 'playoff-a'],
  C: ['brazil', 'morocco', 'scotland', 'haiti'],
  D: ['usa', 'australia', 'paraguay', 'playoff-c'],
  E: ['germany', 'ecuador', 'ivorycoast', 'curacao'],
  F: ['netherlands', 'japan', 'tunisia', 'playoff-b'],
  G: ['belgium', 'iran', 'egypt', 'newzealand'],
  H: ['spain', 'uruguay', 'saudiarabia', 'capeverde'],
  I: ['france', 'senegal', 'norway', 'playoff-2'],
  J: ['argentina', 'austria', 'algeria', 'jordan'],
  K: ['portugal', 'colombia', 'uzbekistan', 'playoff-1'],
  L: ['england', 'croatia', 'panama', 'ghana'],
}

function createGroupStandings(group: string, teamIds: string[]): GroupStandings {
  return {
    group,
    dataStatus: 'pending',
    standings: teamIds.map((teamId, index) => ({
      rank: index + 1,
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      recentForm: [],
    })),
  }
}

export const groupStandings: GroupStandings[] = Object.entries(groups).map(
  ([group, teamIds]) => createGroupStandings(group, teamIds)
)
