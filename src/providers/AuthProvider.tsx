"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { AuthState, AuthCheckResponse } from '@/types'

// AuthContextの作成
const AuthContext = createContext<AuthState & {
  login: () => void
  logout: () => void
}>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  })

  // 認証状態をチェック
  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      
      if (response.status === 200 && response.data) {
        const authData = response.data as AuthCheckResponse
        
        if (authData.authenticated) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: authData.user || null
          })
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null
          })
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      })
    }
  }

  // 初回ロード時に認証状態をチェック
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const login = () => {
    // Google OAuth認証へリダイレクト
    apiClient.redirectToGoogleAuth()
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}