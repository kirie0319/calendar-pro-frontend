import * as React from "react"
import { ChevronLeft, ChevronRight, UserPlus, User, Plus, Settings, Users, LogOut } from "lucide-react"
import { format, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import InviteModal from "./InviteModal"

interface HeaderProps {
  onSignOut?: () => void
}

export default function Header({ onSignOut }: HeaderProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  // ユーザー情報の初期化（ローディング対策）
  const currentUser = user ? {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    initials: user.name.length >= 2 ? user.name.substring(0, 2) : user.name.substring(0, 1)
  } : {
    name: "Loading...",
    email: "loading@example.com", 
    avatar: undefined,
    initials: "L"
  }
  
  // Zustandストアから状態と関数を取得
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    setSelectedDate,
    setMiniCalendarDate,
    currentGroup,
    setCurrentGroup,
    userGroups,
    isCreateGroupDialogOpen,
    setIsCreateGroupDialogOpen,
    isCreatingGroup,
    createGroup
  } = useDashboardStore()
  
  // グループ作成用の状態
  const [newGroupName, setNewGroupName] = React.useState("")
  const [newGroupDescription, setNewGroupDescription] = React.useState("")
  const [createError, setCreateError] = React.useState<string | null>(null)
  
  // 招待モーダル用の状態
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false)
  
  // デバッグログ
  React.useEffect(() => {
    console.log("🔍 Header レンダリング:", { 
      currentGroup, 
      userGroups: userGroups.length,
      isInviteDialogOpen 
    })
  }, [currentGroup, userGroups.length, isInviteDialogOpen])
  
  // 週表示用の計算
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // 日曜日開始
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

  // ナビゲーション関数
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const nextDay = () => setCurrentDate(addDays(currentDate, 1))
  const prevDay = () => setCurrentDate(subDays(currentDate, 1))

  // グループ作成の処理
  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      setCreateError(null)
      try {
        const createdGroup = await createGroup(newGroupName.trim(), newGroupDescription.trim())
        
        // 作成成功時の処理
      setNewGroupName("")
      setNewGroupDescription("")
      setIsCreateGroupDialogOpen(false)
        setCreateError(null)
        console.log("✅ グループ作成成功:", createdGroup)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "グループの作成に失敗しました"
        setCreateError(errorMessage)
        console.error("❌ グループ作成エラー:", error)
      }
    }
  }

  // 招待モーダルを開く処理
  const handleInviteMember = () => {
    console.log("🔍 招待ボタンがクリックされました")
    console.log("🔍 現在のグループ:", currentGroup)
    setIsInviteDialogOpen(true)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white h-[72px] flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 ml-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={
              view === "week" ? prevWeek 
              : view === "day" ? prevDay 
              : prevMonth
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium min-w-[200px] text-center">
            {view === "week" 
              ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
              : view === "day"
              ? format(currentDate, "EEEE, MMMM d, yyyy")
              : format(currentDate, "MMMM yyyy")
            }
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={
              view === "week" ? nextWeek 
              : view === "day" ? nextDay 
              : nextMonth
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const today = new Date()
            setCurrentDate(today)
            setSelectedDate(today)
            // ミニカレンダーも今月に移動
            setMiniCalendarDate(today)
          }}
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Group Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              {currentGroup ? currentGroup.name : "グループを選択"}
              <ChevronRight className="h-3 w-3 rotate-90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>グループを選択</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Create Group Option - Always show as second item */}
            <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>グループを作成</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>新しいグループを作成</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">グループ名</Label>
                    <Input
                      id="group-name"
                      placeholder="グループ名を入力"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">説明（オプション）</Label>
                    <Textarea
                      id="group-description"
                      placeholder="グループの説明を入力"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {createError && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {createError}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateGroupDialogOpen(false)
                        setCreateError(null)
                        setNewGroupName("")
                        setNewGroupDescription("")
                      }}
                      disabled={isCreatingGroup}
                    >
                      キャンセル
                    </Button>
                    <Button 
                      onClick={handleCreateGroup} 
                      disabled={!newGroupName.trim() || isCreatingGroup}
                    >
                      {isCreatingGroup ? "作成中..." : "作成"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Invite Member Option - Show only when group is selected */}
            {currentGroup && (
              <DropdownMenuItem onClick={handleInviteMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>メンバーを招待</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {/* User Groups */}
            {userGroups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => {
                  console.log("🔍 グループが選択されました:", group)
                  setCurrentGroup(group)
                }}
                className={currentGroup?.id === group.id ? "bg-blue-50" : ""}
              >
                <div className="flex flex-col w-full">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-xs text-gray-500">
                    {group.memberCount}人 · {group.role === "owner" ? "オーナー" : group.role === "admin" ? "管理者" : "メンバー"}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            
            {userGroups.length === 0 && (
              <DropdownMenuItem disabled>
                <span className="text-gray-500">参加しているグループがありません</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={view} onValueChange={(value: "month" | "week" | "day") => setView(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>

        {/* Invite User Button - Only show when a group is selected */}
        {currentGroup && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleInviteMember}>
            <UserPlus className="h-4 w-4" />
            Invite user
          </Button>
        )}

        {/* User Navigation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {currentUser.initials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Invite Member Modal */}
      <InviteModal
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        currentGroup={currentGroup}
      />
    </header>
  )
}
