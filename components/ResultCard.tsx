'use client'

import type { Recommendation } from '@/types'
import CourseSlide from './CourseSlide'

const CONGESTION_MAP = {
  low: { label: '한산', color: 'text-[--sage-dark]', dot: 'bg-[--sage]' },
  medium: { label: '보통', color: 'text-yellow-600', dot: 'bg-yellow-400' },
  high: { label: '붐빔', color: 'text-red-500', dot: 'bg-red-400' },
}

interface ResultCardProps {
  data: Recommendation
  onRetry: () => void
}

export default function ResultCard({ data, onRetry }: ResultCardProps) {
  const cong = CONGESTION_MAP[data.congestion]

  function handleMapOpen() {
    window.open(data.mapUrl, '_blank')
  }

  return (
    <div className="h-full overflow-y-auto bg-[--cream]">
      <div className="relative h-48 overflow-hidden border-b border-[--border]"
        style={{ background: 'linear-gradient(135deg, #87A88A, #F2EDE4)' }}>
        {data.heroImageUrl && (
          <img src={data.heroImageUrl} alt={data.city}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,28,28,0.26)] to-transparent" />

        <div className="absolute top-4 right-4">
          {data.event?.isLastDay ? (
            <span className="bg-white/90 text-[--ink] text-xs font-semibold px-3 py-1.5 rounded-full border border-white/70">
              오늘 마지막 날 🎉
            </span>
          ) : (
            <span className="bg-white/90 text-[--ink] text-xs font-semibold px-3 py-1.5 rounded-full border border-white/70">
              오늘 딱이에요 ✨
            </span>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-10 py-8 flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium text-[--muted] uppercase tracking-widest mb-2">오늘의 소도시</p>
          <h2 className="text-4xl sm:text-5xl font-black text-[--ink]">{data.city}</h2>
        </div>

        <div className="border-l-4 border-[--sage] pl-4 py-1">
          <p className="text-sm text-[--muted] leading-relaxed">{data.reason}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-white border border-[--border] text-[--ink] px-3 py-1.5 rounded-full">
            🚗 {data.travelTime}
          </span>
          <span className="text-xs bg-white border border-[--border] text-[--ink] px-3 py-1.5 rounded-full">
            {data.weather.condition === '맑음' ? '☀️' : data.weather.condition === '비' ? '🌧' : '⛅'} {data.weather.condition} {data.weather.temp}°
          </span>
          <span className={`text-xs bg-white border border-[--border] px-3 py-1.5 rounded-full flex items-center gap-1.5 ${cong.color}`}>
            <span className={`w-2 h-2 rounded-full ${cong.dot}`} />
            {cong.label}
          </span>
        </div>

        <CourseSlide course={data.course} />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleMapOpen}
            className="flex-1 bg-[--sage] text-white rounded-xl py-4 font-medium text-sm transition-colors hover:bg-[--sage-dark]"
          >
            지금 출발할게요 →
          </button>
          <button
            onClick={onRetry}
            className="bg-white text-[--ink] border border-[--border] rounded-xl px-5 py-4 font-medium text-sm transition-colors hover:bg-[--sidebar]"
          >
            다시 ↻
          </button>
        </div>
      </div>
    </div>
  )
}
