import type {
  ApiTeamsResponse,
  ApiMatchesResponse,
  ApiStandingsResponse,
} from "./api-types"

const API_BASE = "https://api.football-data.org/v4"
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY || ""
const WORLD_CUP_COMPETITION_CODE = "WC"

// 2026 世界杯 ID（football-data.org 赛事 ID，赛程临近时会分配）
// 在赛事 ID 确定之前，返回 null 由调用方 fallback 到本地数据
const WORLD_CUP_ID_2026 = import.meta.env.VITE_WORLD_CUP_COMPETITION_ID || ""

interface FetchOptions {
  params?: Record<string, string>
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T | null> {
  // 未配置 API_KEY 则不发起请求，调用方 fallback 到本地数据
  if (!API_KEY) {
    return null
  }

  const url = new URL(`${API_BASE}${endpoint}`)
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": API_KEY,
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      console.warn(
        `[API] 请求失败: ${endpoint} — HTTP ${response.status} ${response.statusText}`,
      )
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.warn(
      `[API] 网络错误: ${endpoint} — ${error instanceof Error ? error.message : String(error)}`,
    )
    return null
  }
}

/**
 * 获取2026世界杯参赛队伍信息
 * 如果未配置 API_KEY 或赛事 ID 尚未分配，返回 null
 */
export async function getTeams(): Promise<ApiTeamsResponse | null> {
  if (!WORLD_CUP_ID_2026) {
    return null
  }
  return fetchApi<ApiTeamsResponse>(
    `/competitions/${WORLD_CUP_ID_2026}/teams`,
  )
}

/**
 * 获取赛程/比赛结果
 * 赛事开始后才有数据；若 API 不可用则返回 null
 * @param dateFrom 开始日期过滤（ISO 格式，例如 "2026-06-11"）
 * @param dateTo 结束日期过滤
 * @param matchday 比赛日序号（可选）
 */
export async function getMatches(params?: {
  dateFrom?: string
  dateTo?: string
  matchday?: number
}): Promise<ApiMatchesResponse | null> {
  if (!WORLD_CUP_ID_2026) {
    return null
  }
  const queryParams: Record<string, string> = {}
  if (params?.dateFrom) queryParams.dateFrom = params.dateFrom
  if (params?.dateTo) queryParams.dateTo = params.dateTo
  if (params?.matchday != null) queryParams.matchday = String(params.matchday)

  return fetchApi<ApiMatchesResponse>(
    `/competitions/${WORLD_CUP_ID_2026}/matches`,
    { params: queryParams },
  )
}

/**
 * 获取积分榜
 * 赛事开始后才有数据；若 API 不可用则返回 null
 */
export async function getStandings(): Promise<ApiStandingsResponse | null> {
  if (!WORLD_CUP_ID_2026) {
    return null
  }
  return fetchApi<ApiStandingsResponse>(
    `/competitions/${WORLD_CUP_ID_2026}/standings`,
  )
}

/**
 * 按比赛状态筛选比赛
 * @param status 比赛状态：SCHEDULED / LIVE / IN_PLAY / PAUSED / FINISHED 等
 */
export async function getMatchesByStatus(
  status: string,
): Promise<ApiMatchesResponse | null> {
  if (!WORLD_CUP_ID_2026) {
    return null
  }
  return fetchApi<ApiMatchesResponse>(
    `/competitions/${WORLD_CUP_ID_2026}/matches`,
    { params: { status } },
  )
}
