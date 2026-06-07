const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export function get<T>(endpoint: string): Promise<T> { return request<T>(endpoint) }
export function post<T>(endpoint: string, body: unknown): Promise<T> { return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }) }
export function authGet<T>(endpoint: string): Promise<T> { return request<T>(endpoint) }
export function authPost<T>(endpoint: string, body: unknown): Promise<T> { return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }) }

export function login(username: string) {
  return post<{ token: string; user: { id: number; username: string } }>('/auth/login', { username })
}

export function getTeams(params?: { group?: string; confederation?: string }) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return get(`/teams${qs}`)
}
export function getTeam(id: string) { return get(`/teams/${id}`) }

export function getMatches(params?: { status?: string; round?: string; date?: string }) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return get(`/matches${qs}`)
}
export function getMatch(id: string) { return get(`/matches/${id}`) }
export function getLiveMatches() { return get('/matches/live') }
export function getMatchAnalysis(matchId: string) { return get(`/matches/${matchId}/analysis`) }

export function getStandings(group?: string) { return get(group ? `/standings/${group}` : '/standings') }

export function getVenues() { return get('/venues') }
export function getVenue(id: string) { return get(`/venues/${id}`) }

export function getTournaments() { return get('/history/tournaments') }
export function getRecords() { return get('/history/records') }
export function getCountryHistory() { return get('/history/countries') }

export function getPrediction(matchId: string) { return get(`/predictions/${matchId}`) }

export function getUserPredictions(params?: { matchId?: string; settled?: boolean }) {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
  return authGet(`/user/predictions${qs}`)
}

export function submitPrediction(data: {
  matchId: string; predictedHomeScore: number; predictedAwayScore: number
  predictedResult: 'home_win' | 'draw' | 'away_win'; confidence: number
}) { return authPost('/user/predictions', data) }

export function getUserStats() { return authGet('/user/stats') }
