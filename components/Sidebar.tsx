'use client'

import Link from 'next/link'
import ConditionStep from './ConditionStep'
import type { Duration, Theme, Transport } from '@/types'

export interface Selections {
  date?: string
  transport?: Transport
  duration?: Duration
  theme?: Theme
}

interface Option {
  value: string
  label: string
  emoji?: string
}

interface Section {
  id: keyof Selections
  label: string
  options: Option[]
}

interface SidebarProps {
  selections: Selections
  onSelect: (key: string, value: string) => void
  onSubmit: () => void
  departure: string
  errorMessage?: string
  isSubmitting?: boolean
}

const SECTIONS: Section[] = [
  {
    id: 'date',
    label: '날짜',
    options: [
      { value: 'today', label: '오늘', emoji: '☀️' },
      { value: 'tomorrow', label: '내일', emoji: '🌤' },
      { value: 'weekend', label: '이번 주말', emoji: '🗓' },
    ],
  },
  {
    id: 'transport',
    label: '이동수단',
    options: [
      { value: 'car', label: '자차', emoji: '🚗' },
      { value: 'transit', label: '대중교통', emoji: '🚆' },
    ],
  },
  {
    id: 'duration',
    label: '기간',
    options: [
      { value: 'half', label: '반나절', emoji: '🌅' },
      { value: 'day', label: '하루', emoji: '🌞' },
      { value: 'overnight', label: '1박 이상', emoji: '🌙' },
    ],
  },
  {
    id: 'theme',
    label: '테마',
    options: [
      { value: 'sensibility', label: '감성', emoji: '📷' },
      { value: 'healing', label: '힐링', emoji: '🌿' },
      { value: 'activity', label: '액티비티', emoji: '⛷' },
      { value: 'food', label: '맛집', emoji: '🍽' },
      { value: 'culture', label: '문화', emoji: '🏛' },
    ],
  },
]

function hasAllSelections(selections: Selections) {
  return Boolean(selections.date && selections.transport && selections.duration && selections.theme)
}

export default function Sidebar({
  selections,
  onSelect,
  onSubmit,
  departure,
  errorMessage,
  isSubmitting = false,
}: SidebarProps) {
  const canSubmit = hasAllSelections(selections)

  return (
    <aside className="w-full md:w-72 md:flex-shrink-0 md:h-screen md:sticky md:top-0 overflow-y-auto bg-[--sidebar] px-6 py-8 border-b md:border-b-0 md:border-r border-[--border]">
      <div className="mb-8">
        <p className="text-xl font-black text-[--ink]">P의 여행</p>

        <div className="mt-6">
          <p className="text-xs font-medium text-[--muted] uppercase tracking-widest mb-2">출발지</p>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium text-[--ink]">{departure}</p>
            <Link
              href="/"
              onClick={() => localStorage.removeItem('departure')}
              className="flex-shrink-0 text-xs font-medium text-[--sage-dark]"
            >
              변경
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map(section => (
          <section key={section.id} className="border-t border-[--border] pt-5">
            <p className="text-xs font-medium text-[--muted] uppercase tracking-widest mb-3">
              {section.label}
            </p>
            <ConditionStep
              options={section.options}
              selected={selections[section.id]}
              onSelect={value => onSelect(section.id, value)}
            />
          </section>
        ))}
      </div>

      <div className="border-t border-[--border] mt-6 pt-6">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-[--sage] text-white rounded-xl py-3 font-medium transition-colors hover:bg-[--sage-dark] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[--sage]"
        >
          {isSubmitting ? '추천 중...' : '추천받기'}
        </button>
        {errorMessage && (
          <p className="mt-3 text-xs leading-5 text-red-500">{errorMessage}</p>
        )}
      </div>
    </aside>
  )
}
