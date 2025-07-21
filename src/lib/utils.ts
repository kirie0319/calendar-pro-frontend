import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * UTC時刻文字列（ISO format）をJST時刻文字列（HH:MM）に変換
 * @param utcDateTimeString - UTC時刻のISO文字列（例: "2024-01-15T01:00:00+00:00"）
 * @returns JST時刻文字列（例: "10:00"）
 */
export function formatUtcToJstTime(utcDateTimeString: string): string {
  try {
    const date = parseISO(utcDateTimeString)
    return format(date, 'HH:mm')
  } catch (error) {
    console.error('UTC→JST変換エラー:', error)
    return utcDateTimeString
  }
}

/**
 * UTC時刻文字列（HH:MM）をJST時刻文字列（HH:MM）に変換
 * 日付の指定が必要なため、指定日のUTC時刻として解釈してJSTに変換
 * @param utcTimeString - UTC時刻文字列（例: "01:00"）
 * @param dateString - 日付文字列（例: "2024-01-15"）
 * @returns JST時刻文字列（例: "10:00"）
 */
export function formatUtcTimeToJstTime(utcTimeString: string, dateString: string): string {
  try {
    // UTC時刻として日時を構築
    const utcDateTime = `${dateString}T${utcTimeString}:00+00:00`
    return formatUtcToJstTime(utcDateTime)
  } catch (error) {
    console.error('UTC時刻→JST変換エラー:', error)
    return utcTimeString
  }
}
