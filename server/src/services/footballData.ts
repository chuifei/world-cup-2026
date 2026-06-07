const API_BASE = 'https://api.football-data.org/v4'

function getApiKey(): string { return process.env.FOOTBALL_DATA_API_KEY || '' }
function getCompetitionId(): string { return process.env.WORLD_CUP_ID_2026 || '' }

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) { Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v)) }

  try {
    const response = await fetch(url.toString(), {
      headers: { 'X-Auth-Token': apiKey, 'Accept': 'application/json' },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function getLiveMatches() {
  const compId = getCompetitionId()
  if (!compId) return null
  return fetchApi<{
    matches: Array<{
      id: number; utcDate: string; status: string; stage: string; group: string | null
      homeTeam: { id: number; name: string; shortName: string; crest: string }
      awayTeam: { id: number; name: string; shortName: string; crest: string }
      score: { winner: string | null; fullTime: { home: number | null; away: number | null }; halfTime: { home: number | null; away: number | null } }
    }>
  }>(`/competitions/${compId}/matches`, { status: 'LIVE' })
}

export async function getFinishedMatches() {
  const compId = getCompetitionId()
  if (!compId) return null
  return fetchApi<{
    matches: Array<{
      id: number; status: string
      score: { fullTime: { home: number | null; away: number | null } }
    }>
  }>(`/competitions/${compId}/matches`, { status: 'FINISHED' })
}
