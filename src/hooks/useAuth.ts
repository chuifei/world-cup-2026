import { useState, useCallback } from 'react'

interface AuthState {
  username: string
  userId: number
  token: string
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const userId = localStorage.getItem('userId')
    if (token && username && userId) {
      return { token, username, userId: Number(userId) }
    }
    return null
  })

  const login = useCallback(async (username: string) => {
    const { login: apiLogin } = await import('@/services/client')
    const res = await apiLogin(username)
    localStorage.setItem('token', res.token)
    localStorage.setItem('username', res.user.username)
    localStorage.setItem('userId', String(res.user.id))
    setAuth({ token: res.token, username: res.user.username, userId: res.user.id })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    setAuth(null)
  }, [])

  return { auth, login, logout }
}
