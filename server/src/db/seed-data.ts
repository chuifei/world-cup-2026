import { getDb } from './connection'
import { createTables } from './schema'

createTables()
const db = getDb()

async function seedTeamsAndMatches() {
  // 动态加载前端数据文件（使用 server/ 相对路径）
  const teamsModule = await import('../../../src/data/teams')
  const matchesModule = await import('../../../src/data/matches')
  const standingsModule = await import('../../../src/data/standings')

  const teams: Array<Record<string, unknown>> = teamsModule.teams as Array<Record<string, unknown>>
  const matches: Array<Record<string, unknown>> = matchesModule.matches as Array<Record<string, unknown>>
  const allStandings: Array<Record<string, unknown>> = standingsModule.groupStandings as Array<Record<string, unknown>>

  console.log(`Loading ${teams.length} teams, ${matches.length} matches, ${allStandings.length} groups`)

  // 批量导入时临时关闭外键检查
  db.exec('PRAGMA foreign_keys = OFF')

  const insertTeam = db.prepare(
    'INSERT OR REPLACE INTO teams (id, name, name_en, flag_code, confederation, fifa_rank, group_name, coach_name, coach_nationality, coach_age, coach_since, formation, data_status, qualification_status, world_cup_appearances, best_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertTeamStats = db.prepare(
    'INSERT OR REPLACE INTO team_tournament_stats (team_id, points, goals_for, goals_against, average_possession, matches_played, wins, draws, losses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertPlayer = db.prepare(
    'INSERT OR REPLACE INTO players (id, team_id, name, number, position, club, club_logo, age, height, weight, nationality, flag_code, preferred_foot, market_value, photo_url, birth_date, abilities, tournament_stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertClubHistory = db.prepare(
    'INSERT OR REPLACE INTO club_history (player_id, club_name, period, appearances, goals) VALUES (?, ?, ?, ?, ?)'
  )
  const insertCareerSummary = db.prepare(
    'INSERT OR REPLACE INTO player_career_summary (player_id, first_appearance, total_caps, total_goals, major_tournaments) VALUES (?, ?, ?, ?, ?)'
  )
  const insertTeamHistory = db.prepare(
    'INSERT OR REPLACE INTO world_cup_history (team_id, year, result, host, matches_played, wins, draws, losses, goals_for, goals_against) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )

  for (const team of teams) {
    insertTeam.run(
      team.id, team.name, team.nameEn || null, team.flagCode || null,
      team.confederation || null, team.fifaRank || null, team.group || null,
      (team.coach as Record<string, unknown>)?.name || null,
      (team.coach as Record<string, unknown>)?.nationality || null,
      (team.coach as Record<string, unknown>)?.age || null,
      (team.coach as Record<string, unknown>)?.since || null,
      team.formation || null, team.dataStatus || 'pending',
      team.qualificationStatus || 'pending',
      team.worldCupAppearances || null, team.bestResult || null
    )

    const stats = team.tournamentStats as Record<string, number> || {}
    insertTeamStats.run(team.id, stats.points || 0, stats.goalsFor || 0, stats.goalsAgainst || 0,
      stats.averagePossession || 0, stats.matchesPlayed || 0, stats.wins || 0, stats.draws || 0, stats.losses || 0)

    const players = (team.players as Array<Record<string, unknown>>) || []
    for (const player of players) {
      insertPlayer.run(
        player.id, team.id, player.name, player.number || null, player.position || null,
        player.club || null, player.clubLogo || null, player.age || null, player.height || null,
        player.weight || null, player.nationality || null, player.flagCode || null,
        player.preferredFoot || null, player.marketValue || null, player.photoUrl || null,
        player.birthDate || null,
        player.abilities ? JSON.stringify(player.abilities) : null,
        player.tournamentStats ? JSON.stringify(player.tournamentStats) : null
      )

      const careerSummary = player.careerSummary as Record<string, unknown> || {}
      insertCareerSummary.run(player.id,
        careerSummary.firstAppearance || null, careerSummary.totalCaps || 0,
        careerSummary.totalGoals || 0,
        (careerSummary.majorTournaments as string[])?.join(',') || null)

      const clubs = (careerSummary.clubs as Array<Record<string, unknown>>) || []
      for (const club of clubs) {
        insertClubHistory.run(player.id, club.clubName, club.period || null,
          club.appearances || 0, club.goals || 0)
      }
    }

    const history = (team.historyResults as Array<Record<string, unknown>>) || []
    for (const h of history) {
      insertTeamHistory.run(team.id, h.year, h.result || null, h.host || null,
        h.matchesPlayed || 0, h.wins || 0, h.draws || 0, h.losses || 0,
        h.goalsFor || 0, h.goalsAgainst || 0)
    }
  }

  // 插入比赛数据
  const insertMatch = db.prepare(
    'INSERT OR REPLACE INTO matches (id, home_team_id, away_team_id, home_score, away_score, status, date, venue_id, city, group_name, round, half_time_home_score, half_time_away_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertEvent = db.prepare(
    'INSERT INTO match_events (match_id, minute, type, player_name, team, detail) VALUES (?, ?, ?, ?, ?, ?)'
  )

  for (const match of matches) {
    insertMatch.run(
      match.id, match.homeTeamId, match.awayTeamId,
      match.homeScore ?? null, match.awayScore ?? null,
      match.status, match.date, match.venue || null, match.city || null,
      match.group || null, match.round || null,
      (match.halfTimeScore as [number, number])?.[0] ?? null,
      (match.halfTimeScore as [number, number])?.[1] ?? null
    )

    const events = (match.events as Array<Record<string, unknown>>) || []
    for (const evt of events) {
      insertEvent.run(match.id, evt.minute, evt.type, evt.player, evt.team, evt.detail || null)
    }
  }

  // 插入积分榜
  const insertStanding = db.prepare(
    'INSERT OR REPLACE INTO standings (group_name, team_id, rank, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, recent_form, data_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )

  for (const group of allStandings) {
    const groupName = group.group as string
    const groupStandings = (group.standings as Array<Record<string, unknown>>) || []
    for (const s of groupStandings) {
      insertStanding.run(
        groupName, s.teamId, s.rank, s.played || 0, s.won || 0, s.drawn || 0, s.lost || 0,
        s.goalsFor || 0, s.goalsAgainst || 0, s.goalDifference || 0, s.points || 0,
        s.recentForm ? JSON.stringify(s.recentForm) : null,
        (group as Record<string, unknown>).dataStatus || 'pending'
      )
    }
  }

  console.log('Seed 完成：球队、球员、比赛、积分榜已写入')
  db.exec('PRAGMA foreign_keys = ON')
}

seedTeamsAndMatches().catch(err => {
  console.error('Seed failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
