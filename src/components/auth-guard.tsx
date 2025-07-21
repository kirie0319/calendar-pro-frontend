'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // 認証が必要だが未認証の場合、ログインページにリダイレクト
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        // 認証不要なページに認証済みユーザーがアクセスした場合
        // (例: ログインページに認証済みユーザーがアクセス)
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  // ローディング中
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // 認証が必要だが未認証の場合、何も表示しない（リダイレクト処理中）
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // 認証不要なページに認証済みユーザーがアクセスした場合、何も表示しない（リダイレクト処理中）
  if (!requireAuth && isAuthenticated) {
    return null
  }

  // 条件を満たしている場合、子コンポーネントを表示
  return <>{children}</>
}

// 認証が必要なページ用のラッパー
export function ProtectedRoute({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// 認証不要なページ用のラッパー（認証済みユーザーはダッシュボードにリダイレクト）
export function PublicRoute({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <AuthGuard requireAuth={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
} 