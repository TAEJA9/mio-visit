'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingStatus from '@/components/LoadingStatus'
import ResultCard from '@/components/ResultCard'
import type { Recommendation, TravelCondition, StreamChunk } from '@/types'

function ResultContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('여행지를 찾고 있어요')
  const [result, setResult] = useState<Recommendation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const [lat, lng] = (params.get('dep') ?? '37.5665,126.9780').split(',').map(Number)
    const condition: TravelCondition = {
      departure: { lat, lng, label: params.get('depLabel') ?? '출발지' },
      date: params.get('date') ?? 'today',
      transport: (params.get('transport') ?? 'car') as TravelCondition['transport'],
      duration: (params.get('duration') ?? 'day') as TravelCondition['duration'],
      theme: (params.get('theme') ?? 'healing') as TravelCondition['theme'],
    }

    const fetchRecommendation = async () => {
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(condition),
        })

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const chunk: StreamChunk = JSON.parse(line.replace('data: ', ''))
            if (chunk.type === 'status') setStatus(chunk.message)
            else if (chunk.type === 'result') setResult(chunk.data)
            else if (chunk.type === 'error') setError(chunk.message)
          }
        }
      } catch {
        setError('네트워크 오류가 발생했어요. 다시 시도해주세요.')
      }
    }

    fetchRecommendation()
  }, [params])

  function handleRetry() {
    router.push('/trip')
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl mb-4">😔</p>
        <p className="text-[--green-dark] font-bold mb-2">아쉽게도 지금은 어려워요</p>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={handleRetry}
          className="bg-[--green-deep] text-white px-6 py-3 rounded-xl font-bold">
          다시 시도
        </button>
      </div>
    )
  }

  if (!result) return <LoadingStatus message={status} />

  return <ResultCard data={result} onRetry={handleRetry} />
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingStatus message="준비 중이에요" />}>
      <ResultContent />
    </Suspense>
  )
}
