import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/tournaments', (_req: Request, res: Response): void => {
  res.json(getDb().prepare('SELECT * FROM tournaments ORDER BY year DESC').all())
})

router.get('/records', (_req: Request, res: Response): void => {
  res.json(getDb().prepare('SELECT * FROM world_cup_records').all())
})

router.get('/countries', (_req: Request, res: Response): void => {
  res.json(getDb().prepare('SELECT * FROM country_history').all())
})

export default router
