import { getDb } from '../db/connection'

export function settlePredictions(matchId: string): void {
  const db = getDb()

  const match = db.prepare(
    'SELECT home_score, away_score FROM matches WHERE id = ? AND status = ?'
  ).get(matchId, 'finished') as { home_score: number; away_score: number } | undefined

  if (!match) return

  const homeScore = match.home_score
  const awayScore = match.away_score

  let actualResult: 'home_win' | 'draw' | 'away_win'
  if (homeScore > awayScore) actualResult = 'home_win'
  else if (homeScore < awayScore) actualResult = 'away_win'
  else actualResult = 'draw'

  const predictions = db.prepare(
    'SELECT * FROM user_predictions WHERE match_id = ? AND is_correct IS NULL'
  ).all(matchId) as Array<{
    id: number; predicted_home_score: number; predicted_away_score: number; predicted_result: string; confidence: number
  }>

  const updateStmt = db.prepare(
    "UPDATE user_predictions SET is_correct = ?, points_earned = ?, settled_at = datetime('now') WHERE id = ?"
  )

  for (const pred of predictions) {
    const resultCorrect = pred.predicted_result === actualResult
    const scoreCorrect = pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore

    let points = 0
    if (scoreCorrect) { points = 25 + pred.confidence * 2 }
    else if (resultCorrect) { points = 10 + pred.confidence * 2 }

    updateStmt.run(resultCorrect ? 1 : 0, points, pred.id)
  }
}
