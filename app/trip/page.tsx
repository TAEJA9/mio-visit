'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/BottomSheet'
import ConditionStep from '@/components/ConditionStep'
import type { Transport, Duration, Theme } from '@/types'

const STEPS = [
  {
    id: 'date',
    question: '언제 가실 건가요?',
    options: [
      { value: 'today', label: '오늘', emoji: '☀️' },
      { value: 'tomorrow', label: '내일', emoji: '🌤' },
      { value: 'weekend', label: '이번 주말', emoji: '🗓' },
    ],
  },
  {
    id: 'transport',
    question: '어떻게 이동하실 건가요?',
    options: [
      { value: 'car', label: '자차', emoji: '🚗' },
      { value: 'transit', label: '대중교통', emoji: '🚆' },
    ],
  },
  {
    id: 'duration',
    question: '얼마나 다녀오실 건가요?',
    options: [
      { value: 'half', label: '반나절', emoji: '🌅' },
      { value: 'day', label: '하루', emoji: '🌞' },
      { value: 'overnight', label: '1박 이상', emoji: '🌙' },
    ],
  },
  {
    id: 'theme',
    question: '오늘 어떤 여행이 땡기세요?',
    options: [
      { value: 'sensibility', label: '감성', emoji: '📷' },
      { value: 'healing', label: '힐링', emoji: '🌿' },
      { value: 'activity', label: '액티비티', emoji: '⛷' },
      { value: 'food', label: '맛집', emoji: '🍽' },
      { value: 'culture', label: '문화', emoji: '🏛' },
    ],
  },
]

type Selections = {
  date?: string
  transport?: Transport
  duration?: Duration
  theme?: Theme
}

export default function TripPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState<Selections>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSheetOpen(true), 50)
    return () => clearTimeout(t)
  }, [])

  const currentStep = STEPS[step]
  const currentValue = selections[currentStep.id as keyof Selections]
  const isLastStep = step === STEPS.length - 1

  function handleSelect(value: string) {
    const key = currentStep.id as keyof Selections
    const newSelections = { ...selections, [key]: value }
    setSelections(newSelections)

    if (!isLastStep) {
      setTimeout(() => setStep(s => s + 1), 200)
    }
  }

  function handleBack() {
    if (step === 0) {
      router.push('/')
    } else {
      setStep(s => s - 1)
    }
  }

  function handleConfirm() {
    const departure = localStorage.getItem('departure')
    if (!departure) { router.push('/'); return }

    const dep = JSON.parse(departure)
    const params = new URLSearchParams({
      dep: `${dep.lat},${dep.lng}`,
      depLabel: dep.label,
      date: selections.date ?? 'today',
      transport: selections.transport ?? 'car',
      duration: selections.duration ?? 'day',
      theme: selections.theme ?? 'healing',
    })
    router.push(`/result?${params.toString()}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #4E8B5F 0%, #1A2E1A 100%)' }}>

      {/* 상단 진행 표시 */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="text-white/70 text-lg">←</button>
          <span className="text-white/50 text-sm">{step + 1} / {STEPS.length}</span>
        </div>
        <h1 className="text-white text-3xl font-black leading-snug">
          {currentStep.question}
        </h1>
      </div>

      {/* 진행 바 */}
      <div className="absolute top-0 left-0 h-1 bg-white/20 w-full">
        <div
          className="h-full bg-white/60 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* 바텀 시트 */}
      <BottomSheet isOpen={sheetOpen}>
        <ConditionStep
          options={currentStep.options}
          onSelect={handleSelect}
          selected={currentValue}
          showConfirm={isLastStep}
          onConfirm={handleConfirm}
        />
      </BottomSheet>
    </div>
  )
}
