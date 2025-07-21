// ダッシュボードストア関連の型定義

import { GroupMember } from '@/types/user'
import { Event, CalendarView } from './calendar'
import { Group } from './group'
import { AvailableSlot, MeetingSearchResult } from './meeting'

export interface DashboardState {
  // メインカレンダーの状態
  currentDate: Date
  setCurrentDate: (date: Date) => void
  
  // ミニカレンダーの状態（独立）
  miniCalendarDate: Date
  setMiniCalendarDate: (date: Date) => void
  
  // 選択された日付は両方で共有
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  
  // ミニカレンダーの日付選択処理
  handleMiniCalendarDateSelect: (date: Date | undefined) => void
  
  // ビュー状態
  view: CalendarView
  setView: (view: CalendarView) => void
  
  // イベントダイアログの状態
  isEventDialogOpen: boolean
  setIsEventDialogOpen: (open: boolean) => void
  
  // イベントデータ
  events: Event[]
  setEvents: (events: Event[]) => void
  addEvent: (title: string, date: Date, time: string) => void
  isLoadingEvents: boolean
  loadCalendarEvents: (startDate: Date, endDate: Date) => Promise<void>
  
  // グループ関連の状態
  currentGroup: Group | null
  setCurrentGroup: (group: Group | null) => void
  userGroups: Group[]
  setUserGroups: (groups: Group[]) => void
  isCreateGroupDialogOpen: boolean
  setIsCreateGroupDialogOpen: (open: boolean) => void
  isLoadingGroups: boolean
  isCreatingGroup: boolean
  loadUserGroups: () => Promise<void>
  createGroup: (name: string, description: string) => Promise<Group | null>
  
  // グループメンバー関連
  groupMembers: GroupMember[]
  setGroupMembers: (members: GroupMember[]) => void
  loadGroupMembers: (groupId: string) => Promise<void>
  
  // 空き時間検索結果
  meetingSearchResult: MeetingSearchResult | null
  setMeetingSearchResult: (result: MeetingSearchResult | null) => void
  selectedAvailableSlot: AvailableSlot | null
  setSelectedAvailableSlot: (slot: AvailableSlot | null) => void
  
  // 選択したメンバーの予定表示
  selectedMemberEmails: string[]
  setSelectedMemberEmails: (emails: string[]) => void
  
  // 予約確認ダイアログ
  isBookingDialogOpen: boolean
  setIsBookingDialogOpen: (open: boolean) => void
  createMeetingFromSlot: (bookingData: {
    title: string
    description: string
    start_datetime: string
    end_datetime: string
    attendee_emails: string[]
  }) => Promise<void>
} 