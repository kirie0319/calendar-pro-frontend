// ユーザー関連の型定義

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface DetailedUser extends User {
  department: string
  role: string
  status: "online" | "offline" | "busy"
}

export interface GroupMember {
  name: string
  email: string
  role: string
  department: string
  status: string
  joined_at: string
}
