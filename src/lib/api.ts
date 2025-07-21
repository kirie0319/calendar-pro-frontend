// バックエンドAPI通信用ユーティリティ

import { ApiResponse, MeetingSearchParams, GroupCreateParams } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // FormDataの場合はContent-Typeを設定しない（ブラウザが自動で設定）
      const headers: Record<string, string> = {}
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
      
      const response = await fetch(url, {
        credentials: 'include', // セッションクッキーを含める
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      })

      let data: T | undefined
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      }

      return {
        data,
        status: response.status,
        error: !response.ok ? `HTTP ${response.status}` : undefined
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // 認証関連API
  async checkAuthStatus() {
    return this.makeRequest('/auth/check')
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/user')
  }

  async logout() {
    return this.makeRequest('/logout', {
      method: 'GET'
    })
  }

  // Google OAuth認証開始（リダイレクト）
  redirectToGoogleAuth() {
    window.location.href = `${this.baseURL}/login`
  }

  // カレンダー関連API
  async getCalendarEvents(startDate: string, endDate: string) {
    return this.makeRequest(`/api/calendar/events?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`)
  }

  // グループ関連API
  async getUserGroups() {
    return this.makeRequest('/groups/api/groups')
  }

  async getGroupDetail(groupId: string) {
    return this.makeRequest(`/groups/api/groups/${groupId}`)
  }

  async createGroup(groupData: GroupCreateParams) {
    return this.makeRequest('/groups/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    })
  }

  async getGroupMembers(groupId: string) {
    return this.makeRequest(`/groups/api/groups/${groupId}/members`)
  }

  // ミーティング関連API
  async searchAvailableTimes(searchParams: MeetingSearchParams) {
    // FormDataを作成（バックエンドがFormを期待しているため）
    const formData = new FormData()
    formData.append('group_id', searchParams.group_id.toString())
    searchParams.selected_members.forEach(email => {
      formData.append('selected_members', email)
    })
    formData.append('start_date', searchParams.start_date)
    formData.append('end_date', searchParams.end_date)
    formData.append('start_time', searchParams.start_time)
    formData.append('end_time', searchParams.end_time)
    formData.append('duration', searchParams.duration.toString())

    return this.makeRequest('/api/meeting/search', {
      method: 'POST',
      body: formData,
      headers: {} // FormDataの場合はContent-Typeを設定しない
    })
  }

  async createMeeting(meetingData: {
    title: string
    description: string
    start_datetime: string
    end_datetime: string
    attendee_emails: string[]
  }) {
    // FormDataを作成（バックエンドがFormを期待しているため）
    const formData = new FormData()
    formData.append('title', meetingData.title)
    formData.append('start_datetime', meetingData.start_datetime)
    formData.append('end_datetime', meetingData.end_datetime)
    formData.append('description', meetingData.description)
    meetingData.attendee_emails.forEach(email => {
      formData.append('attendee_emails', email)
    })

    return this.makeRequest('/api/meeting/create', {
      method: 'POST',
      body: formData,
      headers: {} // FormDataの場合はContent-Typeを設定しない
    })
  }

  // アプリケーション状態確認
  async getAppStatus() {
    return this.makeRequest('/status')
  }
}

export const apiClient = new ApiClient()
export default apiClient 