import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getDb } from '../db/connection'
import { LoginRequestSchema } from '@shared/types/user'
import { validate } from '../validators'
import { authLimiter } from '../middleware/rateLimit'
import type { User, LoginResponse } from '@shared/types/user'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

router.post('/login', authLimiter, validate(LoginRequestSchema), (req: Request, res: Response): void => {
  const { username } = req.body as { username: string }
  const db = getDb()

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined

  if (!user) {
    const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username)
    user = { id: Number(result.lastInsertRowid), username, created_at: new Date().toISOString() }
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })

  const response: LoginResponse = { token, user }
  res.json(response)
})

export default router
