// カレンダー関連の型定義

export interface Event {
  id: string
  title: string
  date: Date
  time: string
  duration: number
  color: string
  is_all_day: boolean
}

export interface BackendEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor?: string
  borderColor?: string
}

export type CalendarView = "month" | "week" | "day"

export interface TimeSlot {
  time: Date
  isAvailable: boolean
  events: Event[]
}

export interface MemberEvent {
  email: string
  title: string
  start_time: string
  end_time: string
  start_datetime: string
  end_datetime: string
  color: string
} 