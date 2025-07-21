"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth-guard"
import { 
  SidebarInset, 
  SidebarProvider
} from "@/components/ui/sidebar"
import Header from "@/features/dashboard/components/Header"
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar"
import DashboardCalendar from "@/features/dashboard/components/DashboardCalendar"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import { apiClient } from "@/lib/api"

export default function DashboardPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadCalendarEvents, loadUserGroups, setCurrentGroup, userGroups } = useDashboardStore()
  
  // 招待処理の状態
  const [isProcessingInvite, setIsProcessingInvite] = React.useState(false)

  // 招待コード処理
  const handleInviteProcess = React.useCallback(async (inviteCode: string) => {
    if (!inviteCode || isProcessingInvite) return
    
    setIsProcessingInvite(true)
    console.log("🔗 招待コード処理開始:", inviteCode)
    
    try {
      // 既存のAPI（/groups/join/{invite_code}）を使用してグループ参加
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/groups/join/${inviteCode}`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        console.log("✅ グループ参加成功")
        
        // グループ一覧を再読み込み
        await loadUserGroups()
        
        // 参加したグループを探して自動選択
        setTimeout(() => {
          // userGroupsが更新されるまで少し待つ
          const joinedGroup = userGroups.find(group => group.invite_code === inviteCode)
          if (joinedGroup) {
            setCurrentGroup(joinedGroup)
            console.log("✅ 参加グループに自動切り替え:", joinedGroup.name)
          }
        }, 1000)
        
        // 成功メッセージ（簡易版）
        alert("✅ グループに参加しました！")
        
        // URLのクエリパラメータをクリア
        router.replace('/dashboard', { scroll: false })
        
      } else if (response.status === 302) {
        // リダイレクトの場合（既にメンバーまたは成功）
        console.log("✅ グループ参加完了（リダイレクト）")
        await loadUserGroups()
        alert("✅ グループ参加が完了しました！")
        router.replace('/dashboard', { scroll: false })
        
      } else {
        throw new Error(`参加に失敗しました (${response.status})`)
      }
      
    } catch (error) {
      console.error("❌ 招待コード処理エラー:", error)
      alert("❌ グループの参加に失敗しました。招待URLを確認してください。")
      router.replace('/dashboard', { scroll: false })
    } finally {
      setIsProcessingInvite(false)
    }
  }, [isProcessingInvite, loadUserGroups, setCurrentGroup, userGroups, router])

  // 初期ロード時にカレンダーデータとグループデータを取得
  useEffect(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    // 招待コードチェック
    const inviteCode = searchParams?.get('invite')
    
    // 並行してデータを取得
    Promise.all([
      loadCalendarEvents(startOfMonth, endOfMonth),
      loadUserGroups()
    ]).then(() => {
      // データ読み込み完了後に招待処理
      if (inviteCode) {
        handleInviteProcess(inviteCode)
      }
    }).catch(error => {
      console.error('初期データ取得エラー:', error)
      // エラーでも招待処理は試す
      if (inviteCode) {
        handleInviteProcess(inviteCode)
      }
    })
  }, [loadCalendarEvents, loadUserGroups, searchParams, handleInviteProcess])

  const handleSignOut = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Header - Full Width */}
            <Header onSignOut={handleSignOut} />

            {/* 招待処理中のオーバーレイ */}
            {isProcessingInvite && (
              <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-lg">グループに参加中...</span>
                </div>
              </div>
            )}

            {/* Main Calendar Content */}
            <main className="flex-1 overflow-hidden h-full">
              <DashboardCalendar />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
    </ProtectedRoute>
  )
} 