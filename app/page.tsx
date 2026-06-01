'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('departure')) {
      router.replace('/trip')
    }
  }, [router])

  function handleStart() {
    router.push('/trip')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[--cream] text-center">
      <div className="max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-black text-[--ink] mb-6">P의 여행</h1>
        <p className="font-normal text-[--muted] text-base sm:text-lg leading-8 mb-10">
          계획은 없어도 괜찮아.<br />
          실시간 빅데이터가 오늘의 소도시를 골라줘요.
        </p>

        <button
          onClick={handleStart}
          className="bg-[--sage] text-white rounded-full px-8 py-4 font-medium transition-colors hover:bg-[--sage-dark]"
        >
          지금 떠나볼까요 →
        </button>
      </div>
    </main>
  )
}
