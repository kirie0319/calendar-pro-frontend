"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { PublicRoute } from "@/components/auth-guard"
import { UserAuthForm } from "@/components/user-auth-form"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function LoginContent() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // URL パラメータからエラーメッセージを取得
    if (searchParams) {
      const error = searchParams.get('error')
      if (error === 'auth_failed') {
        setErrorMessage('認証に失敗しました。もう一度お試しください。')
      }
    }
  }, [searchParams])

  return (
    <>
      {/* モバイル表示用 */}
      <div className="md:hidden min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Calendar Pro</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in with Google to continue
            </p>
          </div>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          <UserAuthForm />
          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* デスクトップ表示用 */}
      <div className="relative container hidden flex-1 shrink-0 items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute top-4 right-4 md:top-8 md:right-8"
          )}
        >
          Home
        </Link>
        <div className="text-primary relative hidden h-full flex-col p-10 lg:flex dark:border-r">
          <div className="bg-primary/5 absolute inset-0" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Calendar Pro
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="leading-normal text-balance">
              &ldquo;This calendar application has saved me countless hours of
              coordination and has streamlined our team meetings perfectly.&rdquo;
            </blockquote>
            <footer className="text-sm mt-2">- Sofia Davis</footer>
          </div>
        </div>
        <div className="flex items-center justify-center lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to Calendar Pro
              </h1>
              <p className="text-muted-foreground text-sm">
                Use your Google account to continue
              </p>
            </div>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
            <UserAuthForm />
            <p className="text-muted-foreground px-8 text-center text-sm">
              By clicking continue, you agree to our{" "}
              <Link
                href="#"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </PublicRoute>
  )
} 