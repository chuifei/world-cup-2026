import express from 'express'
import cors from 'cors'
import { createTables } from './db/schema'
import { optionalAuth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimit'
import authRouter from './routes/auth'
import teamsRouter from './routes/teams'
import matchesRouter from './routes/matches'
import standingsRouter from './routes/standings'
import venuesRouter from './routes/venues'
import historyRouter from './routes/history'
import predictionsRouter from './routes/predictions'
import userPredictionsRouter from './routes/userPredictions'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

createTables()

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(apiLimiter)
app.use(optionalAuth)

app.use('/api/auth', authRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/matches', matchesRouter)
app.use('/api/standings', standingsRouter)
app.use('/api/venues', venuesRouter)
app.use('/api/history', historyRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/user', userPredictionsRouter)

app.use(errorHandler)

// 动态导入以避免顶层 await
async function startPolling() {
  const { getLiveMatches, getFinishedMatches } = await import('./services/footballData')
  const { settlePredictions } = await import('./services/settlement')
  const { getDb } = await import('./db/connection')

  setInterval(async () => {
    const db = getDb()

    const liveData = await getLiveMatches()
    if (liveData?.matches) {
      for (const m of liveData.matches) {
        const matchId = `m${m.id}`
        db.prepare(
          `UPDATE matches SET status = 'live', home_score = ?, away_score = ?, half_time_home_score = ?, half_time_away_score = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(m.score.fullTime.home, m.score.fullTime.away, m.score.halfTime.home, m.score.halfTime.away, matchId)
      }
    }

    const finishedData = await getFinishedMatches()
    if (finishedData?.matches) {
      for (const m of finishedData.matches) {
        const matchId = `m${m.id}`
        const existing = db.prepare('SELECT status FROM matches WHERE id = ?').get(matchId) as { status: string } | undefined
        if (existing && existing.status !== 'finished') {
          db.prepare(
            `UPDATE matches SET status = 'finished', home_score = ?, away_score = ?, updated_at = datetime('now') WHERE id = ?`
          ).run(m.score.fullTime.home, m.score.fullTime.away, matchId)
          settlePredictions(matchId)
        }
      }
    }
  }, 60000)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  startPolling()
})
