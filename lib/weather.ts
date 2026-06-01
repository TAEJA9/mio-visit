const MOCK_WEATHER: Record<string, { condition: string; temp: number }> = {
  default: { condition: '맑음', temp: 22 },
}

export async function getWeather(
  lat: number, lng: number, date: string
): Promise<{ condition: string; temp: number }> {
  if (process.env.USE_MOCK === 'true') return MOCK_WEATHER.default

  const baseDate = date.replace(/-/g, '')
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${process.env.WEATHER_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=0500&nx=60&ny=127`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const items = data?.response?.body?.items?.item ?? []
    const sky = items.find((i: { category: string }) => i.category === 'SKY')?.fcstValue
    const tmp = items.find((i: { category: string }) => i.category === 'TMP')?.fcstValue
    const conditionMap: Record<string, string> = { '1': '맑음', '3': '구름많음', '4': '흐림' }
    return { condition: conditionMap[sky] ?? '맑음', temp: Number(tmp) || 22 }
  } catch {
    return MOCK_WEATHER.default
  }
}
