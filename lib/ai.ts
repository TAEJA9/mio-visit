import Anthropic from '@anthropic-ai/sdk'
import type { TravelCondition, Recommendation, StreamChunk } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface CityData {
  name: string
  demandStrength?: number
  diversity?: number
  resourceDemand?: number
  congestion?: number
  weather?: { condition: string; temp: number }
  hasEvent?: boolean
  eventName?: string
}

interface RecommendContext {
  condition: TravelCondition
  candidates: CityData[]
}

function buildPrompt(ctx: RecommendContext): string {
  const { condition, candidates } = ctx
  const themeMap: Record<string, string> = {
    sensibility: '감성 (조용하고 사진 찍기 좋은 곳 선호)',
    healing: '힐링 (한산하고 자연 있는 곳 강하게 선호)',
    activity: '액티비티 (활기 있는 시설 필요)',
    food: '맛집 (소비강도 높은 곳 우선)',
    culture: '문화 (문화자원 수요 높은 곳 우선)',
  }

  return `당신은 한국 소도시 여행 전문가입니다. 아래 데이터를 바탕으로 오늘 방문하기 가장 좋은 소도시 1곳을 골라주세요.

사용자 조건:
- 이동수단: ${condition.transport === 'car' ? '자차' : '대중교통'}
- 여행 시간: ${condition.duration === 'half' ? '반나절' : condition.duration === 'day' ? '하루' : '1박 이상'}
- 테마: ${themeMap[condition.theme]}

소도시 후보 데이터:
${JSON.stringify(candidates, null, 2)}

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "city": "시도 시군구명 (예: 전북 무주)",
  "reason": "추천 이유를 구어체로 1~2문장. 데이터 수치는 언급하지 말고 사람 말로만.",
  "congestion": "low|medium|high",
  "course_spots": ["장소1", "장소2", "장소3"]
}`
}

export async function* getRecommendationStream(
  ctx: RecommendContext,
  cityDetails: { name: string; spots: Array<{ name: string; description: string; imageUrl?: string }> }
): AsyncGenerator<StreamChunk> {
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5'

  const selectionResponse = await client.messages.create({
    model,
    max_tokens: 500,
    messages: [{ role: 'user', content: buildPrompt(ctx) }],
  })

  const raw = (selectionResponse.content[0] as { text: string }).text
  let aiSelection: { city: string; reason: string; congestion: string; course_spots: string[] }

  try {
    aiSelection = JSON.parse(raw)
  } catch {
    yield { type: 'error', message: 'AI 응답 파싱 오류가 발생했어요.' }
    return
  }

  const coursePrompt = `"${aiSelection.city}" 여행 코스를 만들어주세요.
장소 후보: ${JSON.stringify(cityDetails.spots.map(s => s.name))}
테마: ${ctx.condition.theme}
시간: ${ctx.condition.duration}

JSON으로만 답하세요:
[
  {"time": "오전", "name": "장소명", "description": "한 줄 설명 (구어체)"},
  {"time": "점심", "name": "장소명", "description": "한 줄 설명"},
  {"time": "오후", "name": "장소명", "description": "한 줄 설명"}
]`

  const courseResponse = await client.messages.create({
    model,
    max_tokens: 400,
    messages: [{ role: 'user', content: coursePrompt }],
  })

  let course = []
  try {
    course = JSON.parse((courseResponse.content[0] as { text: string }).text)
  } catch {
    course = cityDetails.spots.slice(0, 3).map((s, i) => ({
      time: ['오전', '점심', '오후'][i],
      name: s.name,
      description: s.description,
    }))
  }

  const recommendation: Recommendation = {
    city: aiSelection.city,
    reason: aiSelection.reason,
    congestion: aiSelection.congestion as Recommendation['congestion'],
    weather: cityDetails.spots[0] ? { condition: '맑음', temp: 22 } : { condition: '맑음', temp: 22 },
    travelTime: ctx.condition.transport === 'car' ? '자차 2~3시간' : '대중교통 2~4시간',
    course,
    mapUrl: `https://map.kakao.com/?q=${encodeURIComponent(aiSelection.city)}`,
    heroImageUrl: cityDetails.spots[0]?.imageUrl,
  }

  yield { type: 'result', data: recommendation }
}
