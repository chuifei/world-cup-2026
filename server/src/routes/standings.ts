import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/:group', (req: Request, res: Response): void => {
  const db = getDb()
  const standings = db.prepare('SELECT * FROM standings WHERE group_name = ? ORDER BY rank ASC').all(req.params.group)
  res.json(standings)
})

router.get('/', (_req: Request, res: Response): void => {
  const db = getDb()
  const standings = db.prepare('SELECT * FROM standings ORDER BY group_name, rank ASC').all()
  res.json(standings)
})

export default router
