import * as React from "react"
import { UserPlus, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { Group, GroupDetail } from "../types/group"

interface InviteModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentGroup: Group | null
}

export default function InviteModal({ isOpen, onOpenChange, currentGroup }: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [isLoadingInvite, setIsLoadingInvite] = React.useState(false)
  const [inviteError, setInviteError] = React.useState<string | null>(null)

  // 招待URLを取得
  const fetchInviteUrl = React.useCallback(async () => {
    if (!currentGroup) return
    
    setIsLoadingInvite(true)
    setInviteError(null)
    
    try {
      const response = await apiClient.getGroupDetail(currentGroup.id)
      
      console.log("🔍 API Response Status:", response.status)
      console.log("🔍 API Response Data:", response.data)
      
      if (response.status === 200 && response.data) {
        const groupDetail = response.data as GroupDetail
        console.log("🔍 Group Detail Object:", groupDetail)
        console.log("🔍 Available properties:", Object.keys(groupDetail))
        console.log("🔍 invite_url value:", groupDetail.invite_url)
        console.log("🔍 invite_code value:", groupDetail.invite_code)
        
        // バックエンドから直接招待URLを取得
        if (groupDetail.invite_url) {
          setInviteUrl(groupDetail.invite_url)
          console.log("✅ 招待URL取得成功:", groupDetail.invite_url)
        } else {
          // invite_urlがない場合の一時的なフォールバック
          console.warn("⚠️ invite_urlがレスポンスにありません。フォールバックを使用します。")
          if (groupDetail.invite_code) {
            const fallbackUrl = `${window.location.origin}/groups/join/${groupDetail.invite_code}`
            setInviteUrl(fallbackUrl)
            console.log("🔄 フォールバック招待URL:", fallbackUrl)
          } else {
            throw new Error("招待URLも招待コードも取得できませんでした")
          }
        }
      } else {
        throw new Error(`APIエラー: Status ${response.status}, Error: ${response.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "招待URLの取得に失敗しました"
      setInviteError(errorMessage)
      console.error("❌ 招待URL取得エラー:", error)
    } finally {
      setIsLoadingInvite(false)
    }
  }, [currentGroup])

  // クリップボードコピー処理
  const handleCopyInviteUrl = async () => {
    if (!inviteUrl) return
    
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2秒後にリセット
      console.log("✅ 招待URLをクリップボードにコピーしました")
    } catch (error) {
      console.error("❌ クリップボードコピーエラー:", error)
    }
  }

  // モーダルが開いたときに招待URLを取得
  React.useEffect(() => {
    if (isOpen && currentGroup && !inviteUrl) {
      fetchInviteUrl()
    }
  }, [isOpen, currentGroup, inviteUrl, fetchInviteUrl])

  // モーダルを閉じるときの処理
  const handleClose = () => {
    onOpenChange(false)
    setInviteUrl("")
    setInviteError(null)
    setCopied(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            メンバーを招待
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {currentGroup && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">グループ名</Label>
              <div className="text-lg font-semibold text-blue-600">{currentGroup.name}</div>
            </div>
          )}
          
          {isLoadingInvite && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">招待URL取得中...</span>
            </div>
          )}
          
          {inviteError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {inviteError}
            </div>
          )}
          
          {inviteUrl && !isLoadingInvite && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">招待URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyInviteUrl}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                このURLを共有して新しいメンバーをグループに招待できます
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            {inviteError && (
              <Button 
                variant="outline"
                onClick={fetchInviteUrl}
                disabled={isLoadingInvite}
              >
                再試行
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleClose}
            >
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
