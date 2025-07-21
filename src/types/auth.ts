// 認証関連の型定義

import { User } from './user'

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface AuthCheckResponse {
  authenticated: boolean
  user?: User
  message?: string
  error?: string
}
