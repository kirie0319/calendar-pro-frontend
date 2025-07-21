import * as React from "react"
import { format, addDays } from "date-fns"
import { Plus, Calendar as CalendarIcon, Clock, X, ChevronDown, Home, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger,
  useSidebar 
} from "@/components/ui/sidebar"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import { apiClient } from "@/lib/api"
import { MeetingSearchParams } from "@/types/api"
import { MeetingSearchResult } from "../types/meeting"

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Zustandストアから状態と関数を取得
  const {
    selectedDate,
    miniCalendarDate,
    setMiniCalendarDate,
    handleMiniCalendarDateSelect,
    events,
    isEventDialogOpen,
    setIsEventDialogOpen,
    currentGroup,
    groupMembers,
    loadGroupMembers,
    setMeetingSearchResult,
    setSelectedAvailableSlot,
    setSelectedMemberEmails
  } = useDashboardStore()
  
  // 現在のグループが変更されたときにメンバーを取得
  React.useEffect(() => {
    if (currentGroup?.id) {
      loadGroupMembers(currentGroup.id)
    }
  }, [currentGroup?.id, loadGroupMembers])
  
  // サイドバーの状態を取得
  const { state } = useSidebar()
  
  // ミーティング作成用の状態
  const [selectedMeetingMembers, setSelectedMeetingMembers] = React.useState<string[]>([])
  const [meetingTitle, setMeetingTitle] = React.useState("")
  const [startDate, setStartDate] = React.useState(format(new Date(), "yyyy-MM-dd"))
  const [endDate, setEndDate] = React.useState(format(addDays(new Date(), 7), "yyyy-MM-dd"))
  const [duration, setDuration] = React.useState("60")
  const [startTime, setStartTime] = React.useState("09:00")
  const [endTime, setEndTime] = React.useState("18:00")

  // ミーティングメンバー選択関連の関数
  const toggleMeetingMember = (memberEmail: string) => {
    setSelectedMeetingMembers(prev => 
      prev.includes(memberEmail) 
        ? prev.filter(email => email !== memberEmail)
        : [...prev, memberEmail]
    )
  }

  const getSelectedMeetingMembers = () => {
    return groupMembers.filter(member => selectedMeetingMembers.includes(member.email))
  }

  const handleFindAvailableTimes = async () => {
    console.log("🔍 空き時間検索開始:", {
      title: meetingTitle,
      members: getSelectedMeetingMembers(),
      startDate,
      endDate,
      duration: `${duration} minutes`
    })

    // 入力検証
    if (!meetingTitle.trim()) {
      alert("ミーティングタイトルを入力してください")
      return
    }

    if (selectedMeetingMembers.length === 0) {
      alert("参加者を選択してください")
      return
    }

    if (!currentGroup?.id) {
      alert("グループが選択されていません")
      return
    }

    try {
      // 検索パラメータを構築
      const searchParams: MeetingSearchParams = {
        group_id: parseInt(currentGroup.id),
        selected_members: selectedMeetingMembers,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        duration: parseInt(duration)
      }

      console.log("🔄 API呼び出し:", searchParams)

      // 空き時間検索API呼び出し
      const response = await apiClient.searchAvailableTimes(searchParams)

      if (response.status === 200 && response.data) {
        console.log("✅ 空き時間検索成功:", response.data)
        
        // 検索結果をストアに保存
        const searchResult = response.data as MeetingSearchResult
        setMeetingSearchResult(searchResult)
        
        // 選択中のスロットをクリア
        setSelectedAvailableSlot(null)
        
        // 選択したメンバーのメールアドレスを保存
        setSelectedMemberEmails(selectedMeetingMembers)
        
        const availableSlots = searchResult?.available_slots || []
        if (availableSlots.length > 0) {
          console.log(`✅ ${availableSlots.length}件の空き時間が見つかりました`)
          console.log("空き時間がカレンダーに表示されます")
        } else {
          alert("❌ 指定された条件では空き時間が見つかりませんでした")
        }
      } else {
        console.error("❌ 空き時間検索エラー:", response.error)
        alert(`❌ 検索エラー: ${response.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error("❌ 空き時間検索例外:", error)
      alert("❌ 検索中にエラーが発生しました")
    }

    // モーダルを閉じる
    setIsEventDialogOpen(false)
  }

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </SidebarTrigger>
          {state === "expanded" && (
            <span className="font-semibold text-lg text-gray-900">Calendar Pro</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {state === "collapsed" && (
          <>
            {/* Icon Navigation for collapsed state */}
            <div className="space-y-2">
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="icon"
                className="w-full aspect-square"
                onClick={() => router.push("/dashboard")}
                title="Dashboard"
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant={pathname === "/dashboard/profile" ? "default" : "ghost"}
                size="icon"
                className="w-full aspect-square"
                onClick={() => router.push("/dashboard/profile")}
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        
        {state === "expanded" && (
          <>
            {/* Navigation Menu */}
            <div className="mb-6">
              <nav className="space-y-1">
                <Button
                  variant={pathname === "/dashboard" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={pathname === "/dashboard/profile" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </nav>
            </div>

            {/* Create Event Button */}
            <div className="mb-6">
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Meeting Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Meeting Title</label>
                      <input
                        type="text"
                        placeholder="Enter meeting title"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Select Members */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Invite Members</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-gray-600">
                              {selectedMeetingMembers.length === 0 
                                ? "Select team members"
                                : `${selectedMeetingMembers.length} member${selectedMeetingMembers.length > 1 ? 's' : ''} selected`
                              }
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64">
                          {groupMembers.length === 0 ? (
                            <DropdownMenuItem disabled>
                              <span className="text-gray-500">
                                {currentGroup ? "メンバーがいません" : "グループを選択してください"}
                              </span>
                            </DropdownMenuItem>
                          ) : (
                            groupMembers.map((member) => (
                            <DropdownMenuItem 
                              key={member.email}
                              onSelect={(e) => e.preventDefault()}
                              className="cursor-pointer"
                            >
                              <div 
                                className="flex items-center gap-3 w-full"
                                onClick={() => toggleMeetingMember(member.email)}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedMeetingMembers.includes(member.email)}
                                    onChange={() => toggleMeetingMember(member.email)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                  />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                  {member.name.substring(0, 1)}
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className="text-sm font-medium">{member.name}</span>
                                  <span className="text-xs text-gray-500">{member.department}</span>
                                </div>
                              </div>
                            </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Selected Members Display */}
                      {selectedMeetingMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getSelectedMeetingMembers().map((member) => (
                            <div key={member.email} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                              <span>{member.name}</span>
                              <button
                                onClick={() => toggleMeetingMember(member.email)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Search Period */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Search Period</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Preferred Time Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Start Time</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">End Time</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Duration */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Meeting Duration</label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setIsEventDialogOpen(false)
                          // Reset form when closing
                          setMeetingTitle("")
                          setSelectedMeetingMembers([])
                          setStartDate(format(new Date(), "yyyy-MM-dd"))
                          setEndDate(format(addDays(new Date(), 7), "yyyy-MM-dd"))
                          setDuration("60")
                          setStartTime("09:00")
                          setEndTime("18:00")
                          // Clear search results
                          setMeetingSearchResult(null)
                          setSelectedAvailableSlot(null)
                          setSelectedMemberEmails([])
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleFindAvailableTimes}
                        disabled={!meetingTitle || selectedMeetingMembers.length === 0}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Find Times
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* ミニカレンダー */}
            <div className="mb-6 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleMiniCalendarDateSelect}
                month={miniCalendarDate}
                onMonthChange={setMiniCalendarDate}
                className="rounded-md border bg-white [--cell-size:1.5rem]"
                classNames={{
                  day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                  day_today: "bg-blue-100 text-blue-900 font-medium"
                }}
              />
            </div>

            <div>
              <div className="space-y-2">
                {events
                  .filter(event => event.date >= new Date() && !event.is_all_day)
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-white cursor-pointer"
                    >
                      <div className={cn("w-2 h-2 rounded-full mt-1.5", event.color)}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(event.date, "MMM d")} at {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
