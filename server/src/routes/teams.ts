import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { group, confederation } = req.query
  const db = getDb()

  let sql = 'SELECT * FROM teams WHERE 1=1'
  const params: string[] = []

  if (typeof group === 'string') {
    sql += ' AND group_name = ?'
    params.push(group)
  }
  if (typeof confederation === 'string') {
    sql += ' AND confederation = ?'
    params.push(confederation)
  }

  const teams = db.prepare(sql).all(...params)
  res.json(teams)
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined

  if (!team) {
    res.status(404).json({ error: '球队不存在' })
    return
  }

  const players = db.prepare('SELECT * FROM players WHERE team_id = ?').all(req.params.id)
  const history = db.prepare('SELECT * FROM world_cup_history WHERE team_id = ? ORDER BY year DESC').all(req.params.id)
  const stats = db.prepare('SELECT * FROM team_tournament_stats WHERE team_id = ?').get(req.params.id)

  res.json({ ...team, players, historyResults: history, tournamentStats: stats || {} })
})

export default router
