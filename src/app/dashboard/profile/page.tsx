"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth-guard"
import { 
  SidebarInset, 
  SidebarProvider
} from "@/components/ui/sidebar"
import Header from "@/features/dashboard/components/Header"
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Building, Calendar, Save } from "lucide-react"

export default function ProfilePage() {
  const { logout, user } = useAuth()
  const router = useRouter()

  // プロファイル情報の状態
  const [profile, setProfile] = useState({
    name: user?.name || "Loading...",
    email: user?.email || "loading@example.com",
    phone: "+81-90-1234-5678", // TODO: バックエンドから取得
    department: "開発部", // TODO: バックエンドから取得
    position: "シニアエンジニア", // TODO: バックエンドから取得
    location: "東京オフィス", // TODO: バックエンドから取得
    bio: "プロファイル情報を設定してください。", // TODO: バックエンドから取得
    timezone: "Asia/Tokyo",
    workingHours: {
      start: "09:00",
      end: "18:00"
    }
  })

  // ユーザー情報が更新されたらプロファイルも更新
  React.useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }))
    }
  }, [user])

  const [isEditing, setIsEditing] = useState(false)

  const handleSignOut = async () => {
    await logout()
    router.push('/login')
  }

  const handleSave = () => {
    // TODO: プロファイル更新のAPI呼び出し
    console.log("Saving profile:", profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleWorkingHoursChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }))
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

            {/* Main Profile Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">プロファイル設定</h1>
                    <p className="text-gray-600">個人情報とアカウント設定を管理します</p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={handleSave} className="gap-2">
                          <Save className="h-4 w-4" />
                          保存
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        編集
                      </Button>
                    )}
                  </div>
                </div>

                {/* Profile Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      基本情報
                    </CardTitle>
                    <CardDescription>
                      プロファイルの基本情報を設定します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/avatars/user.jpg" />
                        <AvatarFallback className="text-lg">
                          {profile.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{profile.name}</h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{profile.department}</Badge>
                          <Badge variant="outline">{profile.position}</Badge>
                        </div>
                        {isEditing && (
                          <Button variant="outline" size="sm">
                            画像を変更
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">氏名</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">電話番号</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">勤務地</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">部署</Label>
                        <Input
                          id="department"
                          value={profile.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">役職</Label>
                        <Input
                          id="position"
                          value={profile.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">自己紹介</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="自己紹介を入力してください"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Calendar Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      カレンダー設定
                    </CardTitle>
                    <CardDescription>
                      カレンダーとスケジュールの設定を管理します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">タイムゾーン</Label>
                        <Select
                          value={profile.timezone}
                          onValueChange={(value) => handleInputChange('timezone', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">勤務時間</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time" className="text-xs text-gray-600">開始時刻</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={profile.workingHours.start}
                            onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time" className="text-xs text-gray-600">終了時刻</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={profile.workingHours.end}
                            onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      アカウント設定
                    </CardTitle>
                    <CardDescription>
                      セキュリティとアカウント管理の設定
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">パスワードの変更</h4>
                        <p className="text-sm text-gray-600">アカウントのセキュリティを強化するため定期的にパスワードを変更してください</p>
                      </div>
                      <Button variant="outline">
                        変更
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">二要素認証</h4>
                        <p className="text-sm text-gray-600">追加のセキュリティレイヤーを有効にする</p>
                      </div>
                      <Button variant="outline">
                        設定
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                      <div>
                        <h4 className="font-medium text-red-600">アカウントの削除</h4>
                        <p className="text-sm text-gray-600">アカウントを永久に削除します。この操作は取り消せません。</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        削除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
    </ProtectedRoute>
  )
}
