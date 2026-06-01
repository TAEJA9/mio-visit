import type { Recommendation } from '@/types'
import CourseSlide from './CourseSlide'

const CONGESTION_MAP = {
  low: { label: '한산', color: 'text-green-600', dot: 'bg-green-400' },
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
    <div className="flex flex-col min-h-screen bg-[--green-light]">
      {/* 히어로 */}
      <div className="relative h-64 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4E8B5F, #1A2E1A)' }}>
        {data.heroImageUrl && (
          <img src={data.heroImageUrl} alt={data.city}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* 뱃지 */}
        <div className="absolute top-4 right-4">
          {data.event?.isLastDay ? (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full">
              오늘 마지막 날 🎉
            </span>
          ) : (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full">
              오늘 딱이에요 ✨
            </span>
          )}
        </div>

        {/* 도시명 */}
        <div className="absolute bottom-4 left-4">
          <h2 className="text-white text-3xl font-black drop-shadow-lg">{data.city}</h2>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 px-5 py-5 flex flex-col gap-4">
        {/* AI 설명 */}
        <div className="border-l-4 border-[--green-deep] pl-4 py-1">
          <p className="text-sm text-[--green-dark] leading-relaxed">{data.reason}</p>
        </div>

        {/* 인포 칩 */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-white text-[--green-dark] px-3 py-1.5 rounded-full shadow-sm">
            🚗 {data.travelTime}
          </span>
          <span className="text-xs bg-white text-[--green-dark] px-3 py-1.5 rounded-full shadow-sm">
            {data.weather.condition === '맑음' ? '☀️' : data.weather.condition === '비' ? '🌧' : '⛅'} {data.weather.condition} {data.weather.temp}°
          </span>
          <span className={`text-xs bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 ${cong.color}`}>
            <span className={`w-2 h-2 rounded-full ${cong.dot}`} />
            {cong.label}
          </span>
        </div>

        {/* 코스 슬라이드 */}
        <CourseSlide course={data.course} />
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 flex gap-3">
        <button
          onClick={handleMapOpen}
          className="flex-1 bg-[--green-deep] text-white rounded-2xl py-4 font-bold text-sm"
        >
          지금 출발할게요 →
        </button>
        <button
          onClick={onRetry}
          className="bg-white text-[--green-deep] border border-[--green-border] rounded-2xl px-4 font-semibold text-sm"
        >
          다시 ↻
        </button>
      </div>
    </div>
  )
}
