import * as React from "react"
import { format } from "date-fns"
import { Calendar, Clock, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatUtcToJstTime } from "@/lib/utils"
import { AvailableSlot } from "@/features/dashboard/types/meeting"

interface BookingConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedSlot: AvailableSlot | null
  selectedMembers: string[]
  onConfirm: (bookingData: BookingData) => Promise<void>
}

export interface BookingData {
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  attendee_emails: string[]
}

export default function BookingConfirmDialog({
  isOpen,
  onClose,
  selectedSlot,
  selectedMembers,
  onConfirm
}: BookingConfirmDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // ダイアログが開かれるたびにフォームをリセット
  React.useEffect(() => {
    if (isOpen) {
      setTitle("")
      setDescription("")
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSlot || !title.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const bookingData: BookingData = {
        title: title.trim(),
        description: description.trim(),
        start_datetime: selectedSlot.start_datetime,
        end_datetime: selectedSlot.end_datetime,
        attendee_emails: selectedMembers
      }

      await onConfirm(bookingData)
      onClose()
    } catch (error) {
      console.error('Booking submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedSlot) {
    return null
  }

  // UTC時刻をJSTに変換
  const jstStartTime = formatUtcToJstTime(selectedSlot.start_datetime)
  const jstEndTime = formatUtcToJstTime(selectedSlot.end_datetime)
  
  // 日付をフォーマット
  const slotDate = new Date(selectedSlot.start_datetime)
  const formattedDate = format(slotDate, "MMMM d, yyyy (EEEE)")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ミーティング予約
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 選択された時間スロット情報 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">選択された時間</span>
            </div>
            <div className="text-sm text-green-700">
              <div>{formattedDate}</div>
              <div className="font-medium">{jstStartTime} - {jstEndTime} (JST)</div>
            </div>
          </div>

          {/* 参加者情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">参加者 ({selectedMembers.length}名)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedMembers.map((email) => (
                <Badge key={email} variant="secondary" className="text-xs">
                  {email}
                </Badge>
              ))}
            </div>
          </div>

          {/* ミーティングタイトル */}
          <div className="space-y-2">
            <Label htmlFor="meeting-title">ミーティングタイトル *</Label>
            <Input
              id="meeting-title"
              type="text"
              placeholder="例: チーム定例会議"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* 説明（任意） */}
          <div className="space-y-2">
            <Label htmlFor="meeting-description">説明（任意）</Label>
            <Textarea
              id="meeting-description"
              placeholder="議題や詳細を入力..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  予約中...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  予約する
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 