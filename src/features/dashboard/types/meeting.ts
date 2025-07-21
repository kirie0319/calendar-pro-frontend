// ミーティング関連の型定義

export interface AvailableSlot {
  date: string
  date_str: string
  start_time: string
  end_time: string
  start_datetime: string
  end_datetime: string
}

export interface MemberScheduleEvent {
  title: string
  start_time: string
  end_time: string
  start_datetime: string
  end_datetime: string
  date: string
}

export interface MeetingSearchResult {
  available_slots: AvailableSlot[]
  member_schedules: Record<string, MemberScheduleEvent[]>
  search_period: {
    start_date: string
    end_date: string
    start_time: string
    end_time: string
  }
  total_slots_found: number
}

export interface MeetingCreationParams {
  title: string
  start_datetime: string
  end_datetime: string
  attendee_emails: string[]
  description?: string
}

export interface MeetingSearchForm {
  title: string
  members: string[]
  startDate: string
  endDate: string
  duration: string
  startTime: string
  endTime: string
} 