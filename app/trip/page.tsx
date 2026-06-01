'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Sidebar, { type Selections } from '@/components/Sidebar'
import RightPanel, { type PanelState } from '@/components/RightPanel'
import type { Departure, Recommendation, StreamChunk, TravelCondition } from '@/types'

const DEFAULT_DEPARTURE: Departure = {
  lat: 37.5665,
  lng: 126.978,
  label: '서울',
}

function parseDeparture(stored: string | null): Departure {
  if (!stored) {
    return DEFAULT_DEPARTURE
  }

  try {
    const parsed = JSON.parse(stored) as Partial<Departure>
    if (
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number' &&
      typeof parsed.label === 'string'
    ) {
      return { lat: parsed.lat, lng: parsed.lng, label: parsed.label }
    }
  } catch {
    // Fall back to Seoul if the stored departure is malformed.
  }

  return DEFAULT_DEPARTURE
}

function readDepartureSnapshot(): Departure {
  if (typeof window === 'undefined') return DEFAULT_DEPARTURE
  return parseDeparture(localStorage.getItem('departure'))
}

function subscribeToDepartureStore() {
  return () => {}
}

export default function TripPage() {
  const [selections, setSelections] = useState<Selections>({})
  const departure = useSyncExternalStore(
    subscribeToDepartureStore,
    readDepartureSnapshot,
    () => DEFAULT_DEPARTURE
  )
  const [panelState, setPanelState] = useState<PanelState>('idle')
  const [loadingMessage, setLoadingMessage] = useState('여행지를 찾고 있어요')
  const [result, setResult] = useState<Recommendation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('departure')
    const parsed = parseDeparture(stored)
    const normalized = JSON.stringify(parsed)

    if (stored !== normalized) {
      localStorage.setItem('departure', normalized)
    }
  }, [])

  function handleSelect(key: string, value: string) {
    setSelections(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (panelState === 'loading') return

    if (!selections.date || !selections.transport || !selections.duration || !selections.theme) {
      setError('모든 조건을 선택해주세요.')
      return
    }

    const condition: TravelCondition = {
      departure,
      date: selections.date,
      transport: selections.transport,
      duration: selections.duration,
      theme: selections.theme,
    }

    setPanelState('loading')
    setLoadingMessage('여행지를 찾고 있어요')
    setResult(null)
    setError('')

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condition),
      })

      if (!res.ok) {
        throw new Error('추천 요청에 실패했어요. 잠시 후 다시 시도해주세요.')
      }

      if (!res.body) {
        throw new Error('추천 응답을 읽을 수 없어요. 다시 시도해주세요.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let nextResult: Recommendation | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue

          let chunk: StreamChunk
          try {
            chunk = JSON.parse(part.slice(6))
          } catch {
            continue
          }

          if (chunk.type === 'status') {
            setLoadingMessage(chunk.message)
          } else if (chunk.type === 'result') {
            nextResult = chunk.data
            setResult(chunk.data)
            setPanelState('result')
          } else if (chunk.type === 'error') {
            throw new Error(chunk.message)
          }
        }
      }

      if (!nextResult) {
        throw new Error('조건에 맞는 여행지를 찾지 못했어요. 조건을 바꿔볼까요?')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '네트워크 오류가 발생했어요. 다시 시도해주세요.'
      setPanelState('idle')
      setError(message)
    }
  }

  function handleRetry() {
    setPanelState('idle')
    setLoadingMessage('여행지를 찾고 있어요')
    setResult(null)
    setError('')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[--cream]">
      <Sidebar
        selections={selections}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
        departure={departure.label}
        errorMessage={error}
        isSubmitting={panelState === 'loading'}
      />
      <RightPanel
        state={panelState}
        loadingMessage={loadingMessage}
        result={result}
        onRetry={handleRetry}
      />
    </div>
  )
}
