// グループ関連の型定義

import { GroupMember } from '@/types/user'

export interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  role: "owner" | "admin" | "member"
  invite_code?: string
  created_at?: string
  created_by?: string
  is_active?: boolean
}

export interface GroupDetail extends Group {
  members: GroupMember[]
  creator?: GroupMember
  invite_url?: string  // 招待URL
}

export interface GroupInvitation {
  invite_code: string
  group: Group
  expires_at?: string
} 