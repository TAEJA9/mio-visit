import type { NextRequest } from 'next/server'
import type { TravelCondition, StreamChunk } from '@/types'
import { mockStream } from '@/lib/mock-data'
import { getCandidateCities } from '@/lib/kakao'
import { getCityStats, getCitySpots } from '@/lib/tour-api'
import { getWeather } from '@/lib/weather'
import { getRecommendationStream } from '@/lib/ai'

const encoder = new TextEncoder()

function encodeChunk(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`
}

export async function POST(req: NextRequest) {
  const condition: TravelCondition = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const pipeline =
        process.env.USE_MOCK === 'true'
          ? mockStream()
          : realPipeline(condition)

      try {
        for await (const chunk of pipeline) {
          controller.enqueue(encoder.encode(encodeChunk(chunk)))
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요'
        controller.enqueue(
          encoder.encode(encodeChunk({ type: 'error', message }))
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function* realPipeline(condition: TravelCondition): AsyncGenerator<StreamChunk> {
  yield { type: 'status', message: '출발지 기준 반경을 계산하고 있어요' }
  const candidates = await getCandidateCities(condition.departure, condition.transport, condition.duration)

  if (candidates.length === 0) {
    yield { type: 'error', message: '조건에 맞는 소도시를 찾지 못했어요. 조건을 바꿔볼까요?' }
    return
  }

  yield { type: 'status', message: '각 소도시 데이터를 수집하고 있어요' }
  const cityDataList = await Promise.allSettled(
    candidates.slice(0, 5).map(async c => {
      const stats = await getCityStats(c.name)
      const weather = await getWeather(c.lat, c.lng, condition.date)
      return { ...stats, weather }
    })
  )
  const validCities = cityDataList
    .filter((r): r is PromiseFulfilledResult<{ name: string; demandStrength: number; diversity: number; resourceDemand: number; congestion: number; weather: { condition: string; temp: number } }> => r.status === 'fulfilled')
    .map(r => r.value)

  yield { type: 'status', message: 'AI가 오늘 최적 소도시를 고르고 있어요' }
  const ctx = { condition, candidates: validCities }

  yield { type: 'status', message: '코스를 짜고 있어요' }
  const topCity = validCities[0]
  const spots = await getCitySpots(topCity.name, condition.theme)

  for await (const chunk of getRecommendationStream(ctx, { name: topCity.name, spots })) {
    yield chunk
  }
}
