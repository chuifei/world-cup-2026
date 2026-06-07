export interface ApiError {
  error: string
  details?: unknown
}

export interface PaginationParams {
  offset?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}
