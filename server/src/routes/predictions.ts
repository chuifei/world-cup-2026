import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'

const router = Router()

router.get('/:matchId', (req: Request, res: Response): void => {
  const db = getDb()
  const prediction = db.prepare('SELECT * FROM predictions WHERE match_id = ?').get(req.params.matchId) as Record<string, unknown> | undefined
  if (!prediction) {
    res.status(404).json({ error: '暂无该比赛预测' })
    return
  }
  res.json({
    ...prediction,
    keyFactors: prediction.key_factors ? JSON.parse(prediction.key_factors as string) : [],
    homeRating: prediction.home_rating ? JSON.parse(prediction.home_rating as string) : null,
    awayRating: prediction.away_rating ? JSON.parse(prediction.away_rating as string) : null,
    homeRecentForm: prediction.home_recent_form ? JSON.parse(prediction.home_recent_form as string) : [],
    awayRecentForm: prediction.away_recent_form ? JSON.parse(prediction.away_recent_form as string) : [],
  })
})

export default router
