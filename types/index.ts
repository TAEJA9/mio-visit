export type Transport = 'car' | 'transit'
export type Duration = 'half' | 'day' | 'overnight'
export type Theme = 'sensibility' | 'healing' | 'activity' | 'food' | 'culture'
export type Congestion = 'low' | 'medium' | 'high'

export interface Departure {
  lat: number
  lng: number
  label: string
}

export interface TravelCondition {
  departure: Departure
  date: string        // ISO 날짜 문자열 (e.g. "2026-06-01")
  transport: Transport
  duration: Duration
  theme: Theme
}

export interface CourseItem {
  time: '오전' | '점심' | '오후'
  name: string
  description: string
  imageUrl?: string
}

export interface Event {
  name: string
  description: string
  isLastDay: boolean
}

export interface WeatherInfo {
  condition: string   // "맑음" | "흐림" | "비"
  temp: number        // 섭씨
}

export interface Recommendation {
  city: string        // "전북 무주"
  reason: string      // AI 구어체 추천 이유
  congestion: Congestion
  weather: WeatherInfo
  travelTime: string  // "자차 2시간 20분"
  course: CourseItem[]
  event?: Event
  mapUrl: string      // 카카오맵 딥링크
  heroImageUrl?: string
}

export type StreamChunk =
  | { type: 'status'; message: string }
  | { type: 'result'; data: Recommendation }
  | { type: 'error'; message: string }
