import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/live', (_req: Request, res: Response): void => {
  const db = getDb()
  const matches = db.prepare('SELECT * FROM matches WHERE status = ? ORDER BY date ASC').all('live')
  res.json(matches)
})

router.get('/:id/analysis', (req: Request, res: Response): void => {
  const db = getDb()
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined

  if (!match) {
    res.status(404).json({ error: '比赛不存在' })
    return
  }

  const homeTeamId = match.home_team_id as string
  const awayTeamId = match.away_team_id as string

  const homeTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(homeTeamId)
  const awayTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(awayTeamId)

  const headToHead = db.prepare(
    'SELECT * FROM head_to_head WHERE (team_a_id = ? AND team_b_id = ?) OR (team_a_id = ? AND team_b_id = ?) ORDER BY date DESC LIMIT 10'
  ).all(homeTeamId, awayTeamId, awayTeamId, homeTeamId)

  const homeRecent = db.prepare(
    `SELECT * FROM matches WHERE (home_team_id = ? OR away_team_id = ?) AND status = 'finished' ORDER BY date DESC LIMIT 5`
  ).all(homeTeamId, homeTeamId)

  const awayRecent = db.prepare(
    `SELECT * FROM matches WHERE (home_team_id = ? OR away_team_id = ?) AND status = 'finished' ORDER BY date DESC LIMIT 5`
  ).all(awayTeamId, awayTeamId)

  res.json({ homeTeam, awayTeam, headToHead, homeRecentMatches: homeRecent, awayRecentMatches: awayRecent })
})

router.get('/', (req: Request, res: Response): void => {
  const { status, round, date } = req.query
  const db = getDb()
  let sql = 'SELECT * FROM matches WHERE 1=1'
  const params: string[] = []

  if (typeof status === 'string') { sql += ' AND status = ?'; params.push(status) }
  if (typeof round === 'string') { sql += ' AND round = ?'; params.push(round) }
  if (typeof date === 'string') { sql += ' AND date(date) = date(?)'; params.push(date) }

  sql += ' ORDER BY date ASC'
  const matches = db.prepare(sql).all(...params)
  res.json(matches)
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined

  if (!match) {
    res.status(404).json({ error: '比赛不存在' })
    return
  }

  const events = db.prepare('SELECT * FROM match_events WHERE match_id = ? ORDER BY minute ASC').all(req.params.id)
  const stats = db.prepare('SELECT * FROM match_stats WHERE match_id = ?').get(req.params.id)
  const lineups = db.prepare('SELECT * FROM lineups WHERE match_id = ?').all(req.params.id)

  res.json({ ...match, events, stats, lineups })
})

export default router
