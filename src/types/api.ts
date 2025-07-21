// API関連の型定義

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

export interface MeetingSearchParams {
  group_id: number
  selected_members: string[]
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  duration: number
}

export interface CalendarEventsParams {
  start: string
  end: string
}

export interface GroupCreateParams {
  name: string
  description: string
} 