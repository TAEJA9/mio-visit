const BASE = 'https://apis.data.go.kr/B551011'
const KEY = process.env.TOUR_API_KEY ?? ''

interface CityStats {
  name: string
  demandStrength: number
  diversity: number
  resourceDemand: number
  congestion: number
}

interface SpotInfo {
  name: string
  description: string
  imageUrl?: string
}

export async function getCityStats(cityName: string): Promise<CityStats> {
  if (process.env.USE_MOCK === 'true') {
    return {
      name: cityName,
      demandStrength: Math.random() * 0.8 + 0.2,
      diversity: Math.random() * 0.8 + 0.2,
      resourceDemand: Math.random() * 0.8 + 0.2,
      congestion: Math.random() * 0.5,
    }
  }

  await Promise.allSettled([
    fetch(`${BASE}/DataLabService/areaBasedList1?serviceKey=${KEY}&areaCode=&contentTypeId=&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=PTravel&_type=json`),
    fetch(`${BASE}/DataLabService/areaBasedList1?serviceKey=${KEY}&areaCode=&contentTypeId=&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=PTravel&_type=json`),
    fetch(`${BASE}/DataLabService/areaBasedList1?serviceKey=${KEY}&areaCode=&contentTypeId=&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=PTravel&_type=json`),
    fetch(`${BASE}/DataLabService/areaBasedList1?serviceKey=${KEY}&areaCode=&contentTypeId=&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=PTravel&_type=json`),
  ])

  return {
    name: cityName,
    demandStrength: 0.5,
    diversity: 0.5,
    resourceDemand: 0.5,
    congestion: 0.3,
  }
}

export async function getCitySpots(cityName: string, theme: string): Promise<SpotInfo[]> {
  if (process.env.USE_MOCK === 'true') {
    return [
      { name: `${cityName} 대표 명소`, description: '지역을 대표하는 관광 명소예요.' },
      { name: `${cityName} 맛집 거리`, description: '현지 음식을 맛볼 수 있어요.' },
      { name: `${cityName} 자연 공원`, description: '힐링하기 좋은 자연 공간이에요.' },
    ]
  }

  const res = await fetch(
    `${BASE}/KorService1/areaBasedList1?serviceKey=${KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=PTravel&_type=json&contentTypeId=12`
  )
  const data = await res.json()
  return (data?.response?.body?.items?.item ?? []).slice(0, 5).map((item: { title: string; overview?: string; firstimage?: string }) => ({
    name: item.title,
    description: item.overview?.slice(0, 40) ?? '',
    imageUrl: item.firstimage,
  }))
}
