import { Router, Request, Response } from 'express'
import { getDb } from '../db/connection'
import { UserPredictionBodySchema } from '@shared/types/prediction'
import { requireAuth } from '../middleware/safeAuth'
import { validate } from '../validators'

const router = Router()

router.get('/predictions', requireAuth, (req: Request, res: Response): void => {
  const db = getDb()
  const { matchId, settled } = req.query

  let sql = 'SELECT * FROM user_predictions WHERE user_id = ?'
  const params: (string | number)[] = [req.user!.userId]

  if (typeof matchId === 'string') { sql += ' AND match_id = ?'; params.push(matchId) }
  if (settled === 'true') { sql += ' AND is_correct IS NOT NULL' }
  else if (settled === 'false') { sql += ' AND is_correct IS NULL' }

  sql += ' ORDER BY created_at DESC'
  res.json(db.prepare(sql).all(...params))
})

router.post('/predictions', requireAuth, validate(UserPredictionBodySchema), (req: Request, res: Response): void => {
  const db = getDb()
  const { matchId, predictedHomeScore, predictedAwayScore, predictedResult, confidence } = req.body as {
    matchId: string; predictedHomeScore: number; predictedAwayScore: number; predictedResult: string; confidence: number
  }

  const match = db.prepare('SELECT status FROM matches WHERE id = ?').get(matchId) as { status: string } | undefined
  if (!match) { res.status(404).json({ error: '比赛不存在' }); return }
  if (match.status !== 'pending') { res.status(400).json({ error: '比赛已开始或已结束，无法预测' }); return }

  const existing = db.prepare('SELECT id FROM user_predictions WHERE user_id = ? AND match_id = ?').get(req.user!.userId, matchId)

  if (existing) {
    db.prepare(
      'UPDATE user_predictions SET predicted_home_score = ?, predicted_away_score = ?, predicted_result = ?, confidence = ? WHERE user_id = ? AND match_id = ?'
    ).run(predictedHomeScore, predictedAwayScore, predictedResult, confidence, req.user!.userId, matchId)
  } else {
    db.prepare(
      'INSERT INTO user_predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_result, confidence) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user!.userId, matchId, predictedHomeScore, predictedAwayScore, predictedResult, confidence)
  }

  res.json({ success: true })
})

router.get('/stats', requireAuth, (req: Request, res: Response): void => {
  const db = getDb()
  const row = db.prepare(
    `SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct, COALESCE(SUM(points_earned), 0) as total_points
     FROM user_predictions WHERE user_id = ? AND is_correct IS NOT NULL`
  ).get(req.user!.userId) as { total: number; correct: number; total_points: number }

  res.json({
    total: row.total,
    correct: row.correct,
    winRate: row.total > 0 ? Math.round((row.correct / row.total) * 1000) / 10 : 0,
    totalPoints: row.total_points,
  })
})

export default router
