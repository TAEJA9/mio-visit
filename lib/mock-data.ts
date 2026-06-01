import type { Recommendation, StreamChunk } from '@/types'

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    city: '전북 무주',
    reason: '오늘 서울보다 무주가 훨씬 맑아요. 이번 주말 반딧불 축제 마지막 날이고, 지금 이 시간대가 가장 한산해요.',
    congestion: 'low',
    weather: { condition: '맑음', temp: 24 },
    travelTime: '자차 2시간 20분',
    course: [
      { time: '오전', name: '덕유산 케이블카', description: '탁 트인 능선 뷰. 오전이 안개 없이 가장 맑아요.', imageUrl: undefined },
      { time: '점심', name: '무주 어죽 골목', description: '현지인만 아는 어죽. 향어회도 추천.', imageUrl: undefined },
      { time: '오후', name: '반딧불 축제장', description: '오늘 마지막 날. 해 지면 반딧불 체험 시작.', imageUrl: undefined },
    ],
    event: { name: '반딧불 축제', description: '오늘 마지막 날이에요 🎉', isLastDay: true },
    mapUrl: 'https://map.kakao.com/?q=무주군',
    heroImageUrl: undefined,
  },
  {
    city: '전남 담양',
    reason: '이번 주 담양은 외지인 소비가 평소보다 높고, 지금 막 대나무숲이 예쁜 계절이에요. 혼잡도는 아직 낮아요.',
    congestion: 'low',
    weather: { condition: '맑음', temp: 22 },
    travelTime: '자차 3시간',
    course: [
      { time: '오전', name: '죽녹원', description: '이른 오전이 사람 없이 제일 조용해요.', imageUrl: undefined },
      { time: '점심', name: '담양 떡갈비 거리', description: '대통밥 + 떡갈비 세트. 현지 맛.', imageUrl: undefined },
      { time: '오후', name: '메타세쿼이아길', description: '2km 직선 숲길. 해 질 무렵이 최고.', imageUrl: undefined },
    ],
    event: undefined,
    mapUrl: 'https://map.kakao.com/?q=담양군',
    heroImageUrl: undefined,
  },
  {
    city: '경북 군위',
    reason: '잘 알려지지 않았지만 SNS 언급량이 최근 3주 연속 급상승 중이에요. 삼국유사 테마파크가 조용히 인기를 끌고 있어요.',
    congestion: 'low',
    weather: { condition: '흐림', temp: 19 },
    travelTime: '자차 2시간',
    course: [
      { time: '오전', name: '삼국유사 테마파크', description: '의외로 잘 만들어진 역사 공원. 사람 없음.', imageUrl: undefined },
      { time: '점심', name: '군위 한우 식당', description: '경북 한우 산지. 가격 대비 품질 최상.', imageUrl: undefined },
      { time: '오후', name: '화산산성', description: '트레킹 1시간. 정상에서 군위 전경 조망.', imageUrl: undefined },
    ],
    event: undefined,
    mapUrl: 'https://map.kakao.com/?q=군위군',
    heroImageUrl: undefined,
  },
]

export function getRandomMockRecommendation(): Recommendation {
  return MOCK_RECOMMENDATIONS[Math.floor(Math.random() * MOCK_RECOMMENDATIONS.length)]
}

export async function* mockStream(): AsyncGenerator<StreamChunk> {
  const steps: StreamChunk[] = [
    { type: 'status', message: '출발지 기준 반경을 계산하고 있어요' },
    { type: 'status', message: '소도시 후보를 추려내고 있어요' },
    { type: 'status', message: '각 소도시 데이터를 수집하고 있어요' },
    { type: 'status', message: 'AI가 오늘 최적 소도시를 고르고 있어요' },
    { type: 'status', message: '코스를 짜고 있어요' },
  ]

  for (const step of steps) {
    await new Promise(r => setTimeout(r, 700))
    yield step
  }

  await new Promise(r => setTimeout(r, 500))
  yield { type: 'result', data: getRandomMockRecommendation() }
}