import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, setHours, addMinutes, startOfDay, addDays } from "date-fns"
import { Clock } from "lucide-react"
import { cn, formatUtcTimeToJstTime } from "@/lib/utils"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import BookingConfirmDialog from "./BookingConfirmDialog"

export default function DashboardCalendar() {
  // Zustandストアから状態と関数を取得
  const {
    view,
    currentDate,
    selectedDate,
    setSelectedDate,
    events,
    setIsEventDialogOpen,
    isLoadingEvents,
    loadCalendarEvents,
    meetingSearchResult,
    selectedAvailableSlot,
    setSelectedAvailableSlot,
    selectedMemberEmails,
    isBookingDialogOpen,
    setIsBookingDialogOpen,
    createMeetingFromSlot
  } = useDashboardStore()
  
  // カレンダーイベントを取得するための効果フック
  React.useEffect(() => {
    let startDate: Date
    let endDate: Date
    
    // 表示形式に応じて取得期間を設定
    switch (view) {
      case "month":
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
        break
      case "week":
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
        break
      case "day":
        startDate = startOfDay(currentDate)
        endDate = addDays(startDate, 1)
        break
      default:
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
        break
    }
    
    // カレンダーイベントを取得
    loadCalendarEvents(startDate, endDate)
  }, [view, currentDate, loadCalendarEvents])
  
  // 月表示用の計算
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 週表示用の計算
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // 日曜日開始
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // イベント検索（終日イベントを除外）
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date) && !event.is_all_day)
  }

  // 指定日の空き時間スロットを取得
  const getAvailableSlotsForDate = (date: Date) => {
    if (!meetingSearchResult?.available_slots) return []
    
    const dateStr = format(date, "yyyy-MM-dd")
    return meetingSearchResult.available_slots.filter(slot => slot.date === dateStr)
  }

  // 指定日の選択メンバーの予定を取得
  const getMemberEventsForDate = (date: Date) => {
    if (!meetingSearchResult?.member_schedules || selectedMemberEmails.length === 0) return []
    
    const dateStr = format(date, "yyyy-MM-dd")
    const memberEvents: Array<{
      email: string
      title: string
      start_time: string
      end_time: string
      start_datetime: string
      end_datetime: string
      color: string
    }> = []
    
    // メンバー毎に色を割り当て
    const memberColors = [
      'bg-purple-500',
      'bg-indigo-500', 
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-yellow-500'
    ]
    
    selectedMemberEmails.forEach((email, index) => {
      const memberSchedules = meetingSearchResult.member_schedules[email] || []
      const color = memberColors[index % memberColors.length]
      
      memberSchedules.forEach(event => {
        if (event.date === dateStr) {
          memberEvents.push({
            email,
            title: event.title,
            start_time: formatUtcTimeToJstTime(event.start_time, event.date),  // UTC→JST変換
            end_time: formatUtcTimeToJstTime(event.end_time, event.date),      // UTC→JST変換
            start_datetime: event.start_datetime,
            end_datetime: event.end_datetime,
            color
          })
        }
      })
    })
    
    return memberEvents
  }

  // 週表示用の時間軸生成（0:00 - 23:30、30分間隔）
  const weekTimeSlots = React.useMemo(() => {
    const slots = []
    const baseDate = startOfDay(new Date())
    
    // 0:00から23:30まで30分間隔で生成
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slot = addMinutes(setHours(baseDate, hour), minute)
        slots.push(slot)
      }
    }
    
    return slots
  }, [])

  // イベントの時間から位置を計算（週表示用、24時間・30分単位）
  const getEventPosition = (eventTime: string, duration: number) => {
    const [hours, minutes] = eventTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const top = (totalMinutes / 30) * 30 // 30分 = 30px
    const height = Math.max((duration / 30) * 30, 20) // 最小20px
    return { top, height }
  }

  // 空き時間スロットの時間から位置を計算
  const getSlotPosition = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    const duration = endTotalMinutes - startTotalMinutes
    
    const top = (startTotalMinutes / 30) * 30 // 30分 = 30px
    const height = Math.max((duration / 30) * 30, 20) // 最小20px
    return { top, height }
  }

  // メンバーイベントの時間から位置を計算
  const getMemberEventPosition = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    const duration = endTotalMinutes - startTotalMinutes
    
    const top = (startTotalMinutes / 30) * 30 // 30分 = 30px
    const height = Math.max((duration / 30) * 30, 20) // 最小20px
    return { top, height }
  }

  // Calculate calendar grid height - header (72px) - padding
  const totalDaysInGrid = monthStart.getDay() + monthDays.length
  const weeksInMonth = Math.ceil(totalDaysInGrid / 7)
  const headerHeight = 44 // Week header height
  const availableHeight = `calc((100vh - 72px - ${headerHeight}px - 48px) / ${weeksInMonth})`

  // ローディング状態の表示
  if (isLoadingEvents) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="text-sm text-gray-600">Loading calendar events...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      {view === "month" && (
        <div className="bg-white rounded-lg border h-full flex flex-col">
          {/* Member Legend */}
          {selectedMemberEmails.length > 0 && meetingSearchResult && (
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">Members:</span>
                {selectedMemberEmails.map((email, index) => {
                  const memberColors = [
                    'bg-purple-500',
                    'bg-indigo-500', 
                    'bg-pink-500',
                    'bg-orange-500',
                    'bg-teal-500',
                    'bg-yellow-500'
                  ]
                  const color = memberColors[index % memberColors.length]
                  return (
                    <div key={email} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", color)}></div>
                      <span className="text-gray-700">{email}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Week header */}
          <div className="grid grid-cols-7 border-b h-[44px] flex-shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 flex items-center justify-center text-sm font-medium text-gray-500 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 flex-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }, (_, i) => (
              <div 
                key={`empty-${i}`} 
                className="border-r border-b last:border-r-0"
                style={{ height: availableHeight }}
              ></div>
            ))}
            
            {/* Month days */}
            {monthDays.map((day) => {
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isDayToday = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 overflow-hidden",
                    isSelected && "bg-blue-50",
                    !isSameMonth(day, currentDate) && "bg-gray-100 text-gray-400"
                  )}
                  style={{ height: availableHeight }}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={cn(
                        "text-sm",
                        isDayToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  
                  <div className="space-y-1 overflow-hidden">
                    {/* Available slots indicator */}
                    {getAvailableSlotsForDate(day).length > 0 && (
                      <div className="text-xs p-1 rounded bg-green-100 text-green-800 border border-green-300 truncate">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="truncate">{getAvailableSlotsForDate(day).length} Available</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Member events indicator */}
                    {getMemberEventsForDate(day).length > 0 && (
                      <div className="text-xs p-1 rounded bg-purple-100 text-purple-800 border border-purple-300 truncate">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="truncate">{getMemberEventsForDate(day).length} Member Events</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Regular events */}
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate",
                          event.color
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.time} {event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="bg-white rounded-lg border h-full flex flex-col overflow-hidden">
          {/* Member Legend */}
          {selectedMemberEmails.length > 0 && meetingSearchResult && (
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">Members:</span>
                {selectedMemberEmails.map((email, index) => {
                  const memberColors = [
                    'bg-purple-500',
                    'bg-indigo-500', 
                    'bg-pink-500',
                    'bg-orange-500',
                    'bg-teal-500',
                    'bg-yellow-500'
                  ]
                  const color = memberColors[index % memberColors.length]
                  return (
                    <div key={email} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", color)}></div>
                      <span className="text-gray-700">{email}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Week header with days */}
          <div className="flex border-b bg-gray-50">
            <div className="w-16 flex-shrink-0 border-r"></div> {/* Time column */}
            {weekDays.map((day) => (
              <div 
                key={day.toISOString()} 
                className="flex-1 p-3 border-r last:border-r-0 text-center"
              >
                <div className="text-sm font-medium text-gray-600">
                  {format(day, "EEE")}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-1",
                  isToday(day) && "text-blue-600",
                  selectedDate && isSameDay(day, selectedDate) && "text-blue-600"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Week grid with time slots */}
          <div className="flex-1 overflow-auto">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0 border-r">
                {weekTimeSlots.map((timeSlot, index) => (
                  <div 
                    key={timeSlot.toISOString()} 
                    className={`h-[30px] text-xs text-gray-500 text-right pr-2 pt-1 ${
                      index % 2 === 0 ? 'border-b border-gray-300' : 'border-b border-gray-100'
                    }`}
                  >
                    {index % 2 === 0 ? format(timeSlot, "HH:mm") : ""}
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day)
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={cn(
                      "flex-1 border-r last:border-r-0 relative",
                      isToday(day) && "bg-blue-50/30",
                      selectedDate && isSameDay(day, selectedDate) && "bg-blue-100/50"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    {/* Time grid lines */}
                    {weekTimeSlots.map((timeSlot, index) => (
                      <div 
                        key={timeSlot.toISOString()} 
                        className={`h-[30px] hover:bg-gray-50 cursor-pointer ${
                          index % 2 === 0 ? 'border-b border-gray-200' : 'border-b border-gray-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDate(day)
                          setIsEventDialogOpen(true)
                        }}
                        title={`Create event at ${format(timeSlot, "HH:mm")} on ${format(day, "MMM d")}`}
                      />
                    ))}

                    {/* Available time slots for this day */}
                    {getAvailableSlotsForDate(day).map((slot, index) => {
                      // UTC時刻をJSTに変換
                      const jstStartTime = formatUtcTimeToJstTime(slot.start_time, slot.date)
                      const jstEndTime = formatUtcTimeToJstTime(slot.end_time, slot.date)
                      const position = getSlotPosition(jstStartTime, jstEndTime)
                      const isSelected = selectedAvailableSlot?.start_datetime === slot.start_datetime
                      return (
                        <div
                          key={`slot-${slot.start_datetime}-${index}`}
                          className={cn(
                            "absolute left-1 right-1 rounded text-green-800 text-xs p-1 z-20 cursor-pointer border-2",
                            "hover:bg-green-100 transition-colors",
                            isSelected 
                              ? "bg-green-200 border-green-500 shadow-md" 
                              : "bg-green-50 border-green-300 border-dashed"
                          )}
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`
                          }}
                          onClick={() => {
                            setSelectedAvailableSlot(slot)
                            setIsBookingDialogOpen(true)
                          }}
                          title={`Available: ${jstStartTime} - ${jstEndTime} (JST) - クリックして予約`}
                        >
                          <div className="font-medium truncate">Available</div>
                          <div className="text-xs opacity-90">{jstStartTime}-{jstEndTime}</div>
                        </div>
                      )
                    })}

                    {/* Member events for this day */}
                    {getMemberEventsForDate(day).map((memberEvent, index) => {
                      const position = getMemberEventPosition(memberEvent.start_time, memberEvent.end_time)
                      return (
                        <div
                          key={`member-${memberEvent.email}-${index}`}
                          className={cn(
                            "absolute left-0 right-0 rounded text-white text-xs p-1 z-15 opacity-75",
                            "border-l-2 border-white/30",
                            memberEvent.color
                          )}
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            marginLeft: `${(index % 3) * 2}px`, // 重複する場合の位置調整
                            marginRight: `${2 - (index % 3) * 2}px`
                          }}
                          title={`${memberEvent.email}: ${memberEvent.title} (${memberEvent.start_time}-${memberEvent.end_time})`}
                        >
                          <div className="font-medium truncate">{memberEvent.title}</div>
                          <div className="text-xs opacity-90">{memberEvent.start_time}</div>
                        </div>
                      )
                    })}

                    {/* Events for this day */}
                    {dayEvents.map((event) => {
                      const position = getEventPosition(event.time, event.duration)
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "absolute left-1 right-1 rounded text-white text-xs p-1 z-10 cursor-pointer",
                            "shadow-sm border-l-2 border-white/20",
                            event.color
                          )}
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`
                          }}
                          title={`${event.title} (${event.time})`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-90">{event.time}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {view === "day" && (
        <div className="bg-white rounded-lg border h-full flex flex-col overflow-hidden">
          {/* Member Legend */}
          {selectedMemberEmails.length > 0 && meetingSearchResult && (
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">Members:</span>
                {selectedMemberEmails.map((email, index) => {
                  const memberColors = [
                    'bg-purple-500',
                    'bg-indigo-500', 
                    'bg-pink-500',
                    'bg-orange-500',
                    'bg-teal-500',
                    'bg-yellow-500'
                  ]
                  const color = memberColors[index % memberColors.length]
                  return (
                    <div key={email} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", color)}></div>
                      <span className="text-gray-700">{email}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Day header */}
          <div className="flex border-b bg-gray-50">
            <div className="w-16 flex-shrink-0 border-r"></div> {/* Time column */}
            <div className="flex-1 p-3 text-center">
              <div className="text-sm font-medium text-gray-600">
                {format(currentDate, "EEEE")}
              </div>
              <div className={cn(
                "text-lg font-semibold mt-1",
                isToday(currentDate) && "text-blue-600",
                selectedDate && isSameDay(currentDate, selectedDate) && "text-blue-600"
              )}>
                {format(currentDate, "MMMM d")}
              </div>
            </div>
          </div>

          {/* Day grid with time slots */}
          <div className="flex-1 overflow-auto">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0 border-r">
                {weekTimeSlots.map((timeSlot, index) => (
                  <div 
                    key={timeSlot.toISOString()} 
                    className={`h-[30px] text-xs text-gray-500 text-right pr-2 pt-1 ${
                      index % 2 === 0 ? 'border-b border-gray-300' : 'border-b border-gray-100'
                    }`}
                  >
                    {index % 2 === 0 ? format(timeSlot, "HH:mm") : ""}
                  </div>
                ))}
              </div>

              {/* Day column */}
              <div 
                className={cn(
                  "flex-1 border-r relative",
                  isToday(currentDate) && "bg-blue-50/30",
                  selectedDate && isSameDay(currentDate, selectedDate) && "bg-blue-100/50"
                )}
                onClick={() => setSelectedDate(currentDate)}
              >
                {/* Time grid lines */}
                {weekTimeSlots.map((timeSlot, index) => (
                  <div 
                    key={timeSlot.toISOString()} 
                    className={`h-[30px] hover:bg-gray-50 cursor-pointer ${
                      index % 2 === 0 ? 'border-b border-gray-200' : 'border-b border-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDate(currentDate)
                      setIsEventDialogOpen(true)
                    }}
                    title={`Create event at ${format(timeSlot, "HH:mm")} on ${format(currentDate, "MMM d")}`}
                  />
                ))}

                {/* Available time slots for this day */}
                {getAvailableSlotsForDate(currentDate).map((slot, index) => {
                  // UTC時刻をJSTに変換
                  const jstStartTime = formatUtcTimeToJstTime(slot.start_time, slot.date)
                  const jstEndTime = formatUtcTimeToJstTime(slot.end_time, slot.date)
                  const position = getSlotPosition(jstStartTime, jstEndTime)
                  const isSelected = selectedAvailableSlot?.start_datetime === slot.start_datetime
                  return (
                    <div
                      key={`slot-${slot.start_datetime}-${index}`}
                      className={cn(
                        "absolute left-1 right-1 rounded text-green-800 text-sm p-2 z-20 cursor-pointer border-2",
                        "hover:bg-green-100 transition-colors",
                        isSelected 
                          ? "bg-green-200 border-green-500 shadow-md" 
                          : "bg-green-50 border-green-300 border-dashed"
                      )}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`
                      }}
                      onClick={() => {
                        setSelectedAvailableSlot(slot)
                        setIsBookingDialogOpen(true)
                      }}
                      title={`Available: ${jstStartTime} - ${jstEndTime} (JST) - クリックして予約`}
                    >
                      <div className="font-medium truncate">Available Time</div>
                      <div className="text-xs opacity-90 mt-1">
                        {jstStartTime} - {jstEndTime}
                      </div>
                    </div>
                  )
                })}

                {/* Member events for this day */}
                {getMemberEventsForDate(currentDate).map((memberEvent, index) => {
                  const position = getMemberEventPosition(memberEvent.start_time, memberEvent.end_time)
                  return (
                    <div
                      key={`member-${memberEvent.email}-${index}`}
                      className={cn(
                        "absolute left-0 right-0 rounded text-white text-sm p-2 z-15 opacity-80",
                        "border-l-4 border-white/30",
                        memberEvent.color
                      )}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        marginLeft: `${(index % 3) * 4}px`, // 重複する場合の位置調整
                        marginRight: `${4 - (index % 3) * 4}px`
                      }}
                      title={`${memberEvent.email}: ${memberEvent.title} (${memberEvent.start_time}-${memberEvent.end_time})`}
                    >
                      <div className="font-medium truncate">{memberEvent.title}</div>
                      <div className="text-xs opacity-90 mt-1">
                        {memberEvent.start_time} - {memberEvent.end_time}
                      </div>
                      <div className="text-xs opacity-75 mt-1 truncate">
                        {memberEvent.email}
                      </div>
                    </div>
                  )
                })}

                {/* Events for this day */}
                {getEventsForDate(currentDate).map((event) => {
                  const position = getEventPosition(event.time, event.duration)
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-1 right-1 rounded text-white text-sm p-2 z-10 cursor-pointer",
                        "shadow-sm border-l-4 border-white/20",
                        event.color
                      )}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`
                      }}
                      title={`${event.title} (${event.time})`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-90 mt-1">
                        {event.time} ({event.duration}min)
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 予約確認ダイアログ */}
      <BookingConfirmDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        selectedSlot={selectedAvailableSlot}
        selectedMembers={selectedMemberEmails}
        onConfirm={createMeetingFromSlot}
      />
    </div>
  )
}
