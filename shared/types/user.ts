import { z } from 'zod'

export interface User {
  id: number
  username: string
  created_at: string
}

export const LoginRequestSchema = z.object({
  username: z.string().min(1).max(30),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export interface LoginResponse {
  token: string
  user: User
}
