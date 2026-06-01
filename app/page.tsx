'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('departure')) {
      router.replace('/trip')
    }
  }, [router])

  async function handleGPS() {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않아요.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const departure = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: '현재 위치',
        }
        localStorage.setItem('departure', JSON.stringify(departure))
        router.push('/trip')
      },
      () => {
        setLoading(false)
        setError('위치 권한이 거부됐어요. 직접 입력해주세요.')
      }
    )
  }

  function handleManual() {
    const departure = { lat: 37.5665, lng: 126.9780, label: '서울' }
    localStorage.setItem('departure', JSON.stringify(departure))
    router.push('/trip')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[--green-light]">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-[--green-dark] mb-3">P의 여행</h1>
        <p className="text-[--green-deep] text-base leading-relaxed">
          계획은 없어도 괜찮아.<br />
          실시간 관광 빅데이터가<br />
          오늘 떠날 소도시를 골라줄게요.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleGPS}
          disabled={loading}
          className="w-full bg-[--green-deep] text-white rounded-2xl py-4 font-bold text-base disabled:opacity-60"
        >
          {loading ? '위치 확인 중...' : '📍 내 위치에서 출발'}
        </button>
        <button
          onClick={handleManual}
          className="w-full bg-white text-[--green-deep] border border-[--green-border] rounded-2xl py-4 font-semibold text-base"
        >
          직접 출발지 입력
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
