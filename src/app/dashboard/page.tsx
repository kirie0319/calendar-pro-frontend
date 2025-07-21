"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const { loadCalendarEvents, loadUserGroups } = useDashboardStore()

  // 初期ロード時にカレンダーデータとグループデータを取得
  useEffect(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    // 並行してデータを取得
    Promise.all([
      loadCalendarEvents(startOfMonth, endOfMonth),
      loadUserGroups()
    ]).catch(error => {
      console.error('初期データ取得エラー:', error)
    })
  }, [loadCalendarEvents, loadUserGroups])

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