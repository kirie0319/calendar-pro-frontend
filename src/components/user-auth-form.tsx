"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"

export function UserAuthForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleGoogleLogin = () => {
    setIsLoading(true)
    
    try {
      // バックエンドのGoogle OAuth認証エンドポイントにリダイレクト
      apiClient.redirectToGoogleAuth()
    } catch (error) {
      console.error('認証開始エラー:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  )
} 