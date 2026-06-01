import type { Departure } from '@/types'

const CITY_EXCLUSIONS = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종']

const RADIUS_MAP = {
  car: { half: 80, day: 150, overnight: 250 },
  transit: { half: 60, day: 120, overnight: 200 },
}

const MOCK_CITIES = [
  { name: '전북 무주', lat: 35.9077, lng: 127.6606 },
  { name: '전남 담양', lat: 35.3215, lng: 126.9880 },
  { name: '경북 군위', lat: 36.2396, lng: 128.5714 },
  { name: '충남 공주', lat: 36.4469, lng: 127.1193 },
  { name: '강원 영월', lat: 37.1836, lng: 128.4614 },
  { name: '경남 하동', lat: 35.0676, lng: 127.7514 },
  { name: '충북 괴산', lat: 36.8141, lng: 127.7874 },
  { name: '전북 진안', lat: 35.7917, lng: 127.4243 },
]

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getCandidateCities(
  departure: Departure,
  transport: 'car' | 'transit',
  duration: 'half' | 'day' | 'overnight'
): Promise<Array<{ name: string; lat: number; lng: number; distanceKm: number }>> {
  const radius = RADIUS_MAP[transport][duration]

  if (process.env.USE_MOCK === 'true') {
    return MOCK_CITIES
      .filter(c => !CITY_EXCLUSIONS.some(ex => c.name.includes(ex)))
      .map(c => ({ ...c, distanceKm: distanceKm(departure.lat, departure.lng, c.lat, c.lng) }))
      .filter(c => c.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }

  const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${departure.lng}&y=${departure.lat}`
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } })
  const data = await res.json()
  return MOCK_CITIES
    .map(c => ({ ...c, distanceKm: distanceKm(departure.lat, departure.lng, c.lat, c.lng) }))
    .filter(c => c.distanceKm <= radius)
}
