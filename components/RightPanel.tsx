'use client'

import type { Recommendation } from '@/types'
import LoadingStatus from './LoadingStatus'
import ResultCard from './ResultCard'

export type PanelState = 'idle' | 'loading' | 'result'

interface RightPanelProps {
  state: PanelState
  loadingMessage?: string
  result?: Recommendation | null
  onRetry: () => void
}

export default function RightPanel({
  state,
  loadingMessage = '여행지를 찾고 있어요',
  result,
  onRetry,
}: RightPanelProps) {
  return (
    <section className="flex-1 min-h-[60vh] md:h-screen overflow-y-auto bg-[--cream]">
      {state === 'loading' && <LoadingStatus message={loadingMessage} />}

      {state === 'result' && result && (
        <ResultCard data={result} onRetry={onRetry} />
      )}

      {(state === 'idle' || (state === 'result' && !result)) && (
        <div className="h-full min-h-[60vh] flex items-center justify-center px-8 text-center">
          <p className="whitespace-pre-line text-[--muted] text-sm sm:text-base leading-7">
            왼쪽에서 조건을 선택하고{'\n'}추천받기를 눌러보세요
          </p>
        </div>
      )}
    </section>
  )
}
