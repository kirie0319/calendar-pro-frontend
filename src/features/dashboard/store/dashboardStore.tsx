import { create } from 'zustand'
import { isSameMonth, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, addDays } from 'date-fns'
import { apiClient } from '@/lib/api'
import { 
  DashboardState,
  Event, 
  BackendEvent,
  Group
} from '../types'
import { GroupMember } from '@/types/user'

// バックエンドイベントをフロントエンド形式に変換
const convertBackendEventToFrontend = (backendEvent: BackendEvent): Event => {
  const startDate = parseISO(backendEvent.start)
  const endDate = parseISO(backendEvent.end)
  
  // 継続時間を分で計算
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  
  // 色を設定（バックエンドから取得するか、デフォルト値）
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
    'bg-red-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-pink-500'
  ]
  const colorIndex = Math.abs(backendEvent.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
  const color = backendEvent.backgroundColor ? 'bg-blue-500' : colors[colorIndex]
  
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    date: startDate,
    time: format(startDate, 'HH:mm'),
    duration,
    color,
    is_all_day: backendEvent.allDay || false
  }
}

// ミニカレンダーの日付選択ハンドラー
const handleMiniCalendarDateSelect = (date: Date | undefined, get: () => DashboardState, set: (state: Partial<DashboardState>) => void) => {
  if (date && !isSameMonth(date, get().miniCalendarDate)) {
    set({ miniCalendarDate: date })
  }
  set({ selectedDate: date })
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // 初期状態
  currentDate: new Date(),
  miniCalendarDate: new Date(),
  selectedDate: new Date(),
  view: "month",
  isEventDialogOpen: false,
  
  // グループ関連の初期状態
  currentGroup: null,
  userGroups: [],
  isCreateGroupDialogOpen: false,
  isLoadingGroups: false,
  isCreatingGroup: false,
  
  // イベントデータ（バックエンドから取得）
  events: [],
  isLoadingEvents: false,
  
  // グループメンバーデータ（実データ）
  groupMembers: [],
  
  // 空き時間検索結果データ
  meetingSearchResult: null,
  selectedAvailableSlot: null,
  
  // 選択したメンバーの予定表示
  selectedMemberEmails: [],
  
  // 予約確認ダイアログの状態
  isBookingDialogOpen: false,
  
  // Actions
  setCurrentDate: (date) => set({ currentDate: date }),
  setMiniCalendarDate: (date) => set({ miniCalendarDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setView: (view) => set({ view }),
  setIsEventDialogOpen: (open) => set({ isEventDialogOpen: open }),
  setEvents: (events) => set({ events }),
  
  // 空き時間検索結果の管理
  setMeetingSearchResult: (result) => set({ meetingSearchResult: result }),
  setSelectedAvailableSlot: (slot) => set({ selectedAvailableSlot: slot }),
  
  // 選択したメンバーの予定管理
  setSelectedMemberEmails: (emails) => set({ selectedMemberEmails: emails }),
  
  // 予約確認ダイアログの管理
  setIsBookingDialogOpen: (open) => set({ isBookingDialogOpen: open }),
  
  // ミーティング予約機能
  createMeetingFromSlot: async (bookingData) => {
    try {
      console.log('🔄 ミーティング予約開始:', bookingData)
      
      const response = await apiClient.createMeeting(bookingData)
      
      if (response.status === 200 && response.data) {
        console.log('✅ ミーティング予約成功:', response.data)
        
        // 予約成功後、検索結果をクリアして選択中のスロットをリセット
        set({
          selectedAvailableSlot: null,
          meetingSearchResult: null,
          selectedMemberEmails: [],
          isBookingDialogOpen: false
        })
        
        // カレンダーを再読み込み（新しいイベントを反映）
        const { currentDate, view, loadCalendarEvents } = get()
        let startDate: Date
        let endDate: Date
        
        switch (view) {
          case "month":
            startDate = startOfMonth(currentDate)
            endDate = endOfMonth(currentDate)
            break
          case "week":
            startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
            endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
            break
          case "day":
            startDate = startOfDay(currentDate)
            endDate = addDays(startDate, 1)
            break
          default:
            startDate = startOfMonth(currentDate)
            endDate = endOfMonth(currentDate)
            break
        }
        
        await loadCalendarEvents(startDate, endDate)
        
        alert('✅ ミーティングが正常に予約されました！')
      } else {
        console.error('❌ ミーティング予約エラー:', response.error)
        alert(`❌ 予約エラー: ${response.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error('❌ ミーティング予約例外:', error)
      alert('❌ 予約中にエラーが発生しました')
    }
  },
  
  // ミニカレンダーの日付選択（月変更も含む）
  handleMiniCalendarDateSelect: (date: Date | undefined) => {
    handleMiniCalendarDateSelect(date, get, set)
  },
  
  // カレンダーイベントをバックエンドから取得
  loadCalendarEvents: async (startDate: Date, endDate: Date) => {
    set({ isLoadingEvents: true })
    try {
      const startISO = startDate.toISOString()
      const endISO = endDate.toISOString()
      
      const response = await apiClient.getCalendarEvents(startISO, endISO)
      
      if (response.status === 200 && response.data) {
        const backendEvents = response.data as BackendEvent[]
        const convertedEvents = backendEvents.map(convertBackendEventToFrontend)
        set({ events: convertedEvents })
        console.log(`✅ カレンダーイベント取得成功: ${convertedEvents.length}件`)
      } else {
        console.error('カレンダーイベント取得エラー:', response.error)
        set({ events: [] })
      }
    } catch (error) {
      console.error('カレンダーイベント取得エラー:', error)
      set({ events: [] })
    } finally {
      set({ isLoadingEvents: false })
    }
  },
  
  // イベント追加（ローカル）
  addEvent: (title: string, date: Date, time: string) => {
    const newEvent: Event = {
      id: `local-${Date.now()}`,
      title,
      date,
      time,
      duration: 60,
      color: 'bg-blue-500',
      is_all_day: false
    }
    set((state) => ({ events: [...state.events, newEvent] }))
  },
  
  // グループ関連のアクション
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setUserGroups: (groups) => set({ userGroups: groups }),
  setIsCreateGroupDialogOpen: (open) => set({ isCreateGroupDialogOpen: open }),
  
  // ユーザーのグループ一覧をバックエンドから取得
  loadUserGroups: async () => {
    set({ isLoadingGroups: true })
    try {
      const response = await apiClient.getUserGroups()
      
      if (response.status === 200 && response.data) {
        const groups = response.data as Group[]
        set({ userGroups: groups })
        console.log(`✅ グループ取得成功: ${groups.length}件`)
      } else {
        console.error('グループ取得エラー:', response.error)
        set({ userGroups: [] })
      }
    } catch (error) {
      console.error('グループ取得エラー:', error)
      set({ userGroups: [] })
    } finally {
      set({ isLoadingGroups: false })
    }
  },
  
  // グループ作成
  createGroup: async (name: string, description: string): Promise<Group | null> => {
    set({ isCreatingGroup: true })
    try {
      const response = await apiClient.createGroup({ name, description })
      
      if (response.status === 201 && response.data) {
        const newGroup = response.data as Group
        set((state) => ({ 
          userGroups: [...state.userGroups, newGroup],
          currentGroup: newGroup 
        }))
        console.log(`✅ グループ作成成功: ${newGroup.name}`)
        return newGroup
      } else {
        console.error('グループ作成エラー:', response.error)
        return null
      }
    } catch (error) {
      console.error('グループ作成エラー:', error)
      return null
    } finally {
      set({ isCreatingGroup: false })
    }
  },
  
  // グループメンバー関連のアクション
  setGroupMembers: (members) => set({ groupMembers: members }),
  
  // グループメンバーをバックエンドから取得
  loadGroupMembers: async (groupId: string) => {
    try {
      const response = await apiClient.getGroupMembers(groupId)
      
      if (response.status === 200 && response.data) {
        const members = response.data as GroupMember[]
        set({ groupMembers: members })
        console.log(`✅ グループメンバー取得成功: ${members.length}名`)
      } else {
        console.error('グループメンバー取得エラー:', response.error)
        set({ groupMembers: [] })
      }
    } catch (error) {
      console.error('グループメンバー取得エラー:', error)
      set({ groupMembers: [] })
    }
  }
}))
