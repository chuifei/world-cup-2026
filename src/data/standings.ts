import type { GroupStandings } from '../types/standing'

/**
 * 2026 世界杯小组赛积分榜
 *
 * 说明：2026世界杯尚未开赛，所有小组积分榜均为初始状态。
 * 12个小组（A-L）的球队对阵尚未通过抽签确定，此处仅保留小组标识，
 * 所有统计数据均为零。
 *
 * 数据状态：pending（待比赛开始后更新）
 */

function emptyGroup(group: string): GroupStandings {
  return {
    group,
    dataStatus: 'pending',
    standings: [
      { rank: 0, teamId: 'tbd', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: [] },
      { rank: 0, teamId: 'tbd', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: [] },
      { rank: 0, teamId: 'tbd', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: [] },
      { rank: 0, teamId: 'tbd', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: [] },
    ],
  }
}

export const groupStandings: GroupStandings[] = [
  emptyGroup('A'),
  emptyGroup('B'),
  emptyGroup('C'),
  emptyGroup('D'),
  emptyGroup('E'),
  emptyGroup('F'),
  emptyGroup('G'),
  emptyGroup('H'),
  emptyGroup('I'),
  emptyGroup('J'),
  emptyGroup('K'),
  emptyGroup('L'),
]
