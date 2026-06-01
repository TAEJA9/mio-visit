import type { NextRequest } from 'next/server'
import type { TravelCondition, StreamChunk } from '@/types'
import { mockStream } from '@/lib/mock-data'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function* realPipeline(condition: TravelCondition): AsyncGenerator<StreamChunk> {
  yield { type: 'error', message: 'API 키를 설정해주세요 (USE_MOCK=false)' }
}
