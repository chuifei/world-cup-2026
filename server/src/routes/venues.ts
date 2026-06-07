import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  const db = getDb()
  res.json(db.prepare('SELECT * FROM venues').all())
})

router.get('/:id', (req: Request, res: Response): void => {
  const db = getDb()
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id)
  if (!venue) { res.status(404).json({ error: '场地不存在' }); return }
  res.json(venue)
})

export default router
