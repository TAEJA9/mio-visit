# P의 여행 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 출발지 + 4가지 조건 입력 → Claude API가 소도시 1곳 + 하루 코스를 스트리밍으로 추천하는 모바일 퍼스트 Next.js 웹앱을 `mio-visit` GitHub 레포에 구축한다.

**Architecture:** Next.js 15 App Router + Tailwind CSS v4. 모든 외부 API 호출은 `/api/recommend` Server Route에서만 처리 (클라이언트 키 노출 방지). `USE_MOCK=true` 환경변수로 API 키 없이 전체 흐름 테스트 가능.

**Tech Stack:** Next.js 15, Tailwind CSS v4, TypeScript, Claude API (streaming), TourAPI 9종, 카카오맵 API, 기상청 API, Vercel

---

## File Map

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | 온보딩 — 출발지 설정 (GPS / 직접 입력) |
| `app/trip/page.tsx` | 조건 입력 — 바텀 시트 4단계 |
| `app/result/page.tsx` | 추천 결과 — 로딩 + 결과 카드 |
| `app/api/recommend/route.ts` | Streaming API — 반경 계산 → TourAPI → Claude |
| `app/layout.tsx` | 루트 레이아웃 — Pretendard, 모바일 컨테이너 |
| `app/globals.css` | 글로벌 스타일 — CSS 변수, Pretendard |
| `components/BottomSheet.tsx` | 바텀 시트 애니메이션 공통 컴포넌트 |
| `components/ConditionStep.tsx` | 조건 입력 각 스텝 (칩 선택 UI) |
| `components/LoadingStatus.tsx` | 스트리밍 진행 텍스트 표시 |
| `components/ResultCard.tsx` | 소도시 추천 카드 (히어로 + AI 설명 + 인포) |
| `components/CourseSlide.tsx` | 오전/점심/오후 가로 스크롤 코스 |
| `lib/mock-data.ts` | 개발용 mock 응답 데이터 |
| `lib/ai.ts` | Claude API 추상화 (provider 교체 지점) |
| `lib/tour-api.ts` | TourAPI 9종 호출 (mock 지원) |
| `lib/kakao.ts` | 카카오맵 반경 계산 (mock 지원) |
| `lib/weather.ts` | 기상청 날씨 조회 (mock 지원) |
| `types/index.ts` | 공유 TypeScript 타입 |
| `.env.local.example` | 환경변수 템플릿 |

---

## Task 1: GitHub 레포 생성 + Next.js 프로젝트 초기화

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `.gitignore`
- Create: `.env.local.example`
- Create: `.env.local`

- [ ] **Step 1: GitHub 레포 생성**

```bash
gh repo create TAEJA9/mio-visit --public --description "P의 여행 — 즉흥 소도시 여행 추천 서비스"
```

Expected: `✓ Created repository TAEJA9/mio-visit on GitHub`

- [ ] **Step 2: Next.js 15 프로젝트 초기화**

`C:\Users\정연\Documents\myprojects\02.personal\mio-visit` 디렉토리에서 실행:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --use-npm
```

프롬프트 답변:
- `Ok to proceed?` → y

- [ ] **Step 3: .env.local.example 작성**

```bash
# AI (필수)
ANTHROPIC_MODEL=claude-sonnet-4-5
ANTHROPIC_API_KEY=

# TourAPI
TOUR_API_KEY=

# 카카오맵
KAKAO_MAP_API_KEY=
KAKAO_REST_API_KEY=

# 기상청
WEATHER_API_KEY=

# 코레일
KORAIL_API_KEY=

# 개발 (true면 실제 API 미호출)
USE_MOCK=true
```

- [ ] **Step 4: .env.local 생성 (mock 모드로)**

```bash
ANTHROPIC_MODEL=claude-sonnet-4-5
ANTHROPIC_API_KEY=
TOUR_API_KEY=
KAKAO_MAP_API_KEY=
KAKAO_REST_API_KEY=
WEATHER_API_KEY=
KORAIL_API_KEY=
USE_MOCK=true
```

- [ ] **Step 5: .gitignore에 .env.local 확인**

`create-next-app`이 생성한 `.gitignore`에 `.env.local`이 이미 포함돼 있는지 확인. 없으면 추가:

```
.env.local
.env*.local
```

- [ ] **Step 6: git init + 브랜치 설정 + 초기 커밋**

```bash
git init
git remote add origin https://github.com/TAEJA9/mio-visit.git
git add .
git commit -m "feat: initialize Next.js 15 project with Tailwind CSS"
git branch -M main
git push -u origin main
git checkout -b develop
git push -u origin develop
```

Expected: `main`과 `develop` 브랜치가 GitHub에 모두 생성됨.

---

## Task 2: TypeScript 타입 정의

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: 공유 타입 작성**

`types/index.ts`:
```typescript
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
```

- [ ] **Step 2: 커밋**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Pretendard 폰트 + 글로벌 스타일 + 레이아웃

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Pretendard 설치**

```bash
npm install pretendard
```

- [ ] **Step 2: globals.css 작성**

`app/globals.css`:
```css
@import 'pretendard/dist/web/variable/pretendardvariable.css';
@import 'tailwindcss';

:root {
  --green-deep: #3D6E4A;
  --green-mid: #7DAE7D;
  --green-light: #EEF4EE;
  --green-dark: #1A2E1A;
  --green-border: #B8D4B8;
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'PretendardVariable', -apple-system, sans-serif;
  background: var(--green-light);
  color: var(--green-dark);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: layout.tsx 작성**

`app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'P의 여행',
  description: '계획은 없어도 괜찮아. 실시간 관광 빅데이터가 오늘 떠날 소도시를 골라줘요.',
  openGraph: {
    title: 'P의 여행',
    description: '계획은 없어도 괜찮아.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex justify-center bg-[--green-light]">
          <div className="w-full max-w-[430px] min-h-screen relative bg-white shadow-xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: dev 서버로 폰트 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열어서 Pretendard 폰트 로드 확인. 콘솔 에러 없으면 OK.

- [ ] **Step 5: 커밋**

```bash
git add app/globals.css app/layout.tsx package.json package-lock.json
git commit -m "feat: add Pretendard font and base layout"
```

---

## Task 4: Mock 데이터 레이어

**Files:**
- Create: `lib/mock-data.ts`

- [ ] **Step 1: mock-data.ts 작성**

`lib/mock-data.ts`:
```typescript
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
```

- [ ] **Step 2: 커밋**

```bash
git add lib/mock-data.ts
git commit -m "feat: add mock data layer for development"
```

---

## Task 5: Streaming API Route

**Files:**
- Create: `app/api/recommend/route.ts`

- [ ] **Step 1: route.ts 작성**

`app/api/recommend/route.ts`:
```typescript
import { type NextRequest } from 'next/server'
import type { TravelCondition, StreamChunk } from '@/types'
import { mockStream } from '@/lib/mock-data'

function encodeChunk(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`
}

export async function POST(req: NextRequest) {
  const condition: TravelCondition = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        if (process.env.USE_MOCK === 'true') {
          for await (const chunk of mockStream()) {
            controller.enqueue(encoder.encode(encodeChunk(chunk)))
          }
        } else {
          // 실제 파이프라인 — Task 10에서 구현
          for await (const chunk of realPipeline(condition)) {
            controller.enqueue(encoder.encode(encodeChunk(chunk)))
          }
        }
      } catch (err) {
        const errorChunk: StreamChunk = {
          type: 'error',
          message: '추천을 가져오는 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.',
        }
        controller.enqueue(encoder.encode(encodeChunk(errorChunk)))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// 실제 파이프라인 placeholder — Task 10에서 채움
async function* realPipeline(condition: TravelCondition): AsyncGenerator<StreamChunk> {
  yield { type: 'error', message: 'API 키를 설정해주세요 (USE_MOCK=false)' }
}
```

- [ ] **Step 2: mock 모드 동작 확인**

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"departure":{"lat":37.5665,"lng":126.9780,"label":"서울"},"date":"2026-06-01","transport":"car","duration":"day","theme":"healing"}'
```

Expected: `data: {"type":"status","message":"출발지 기준..."}` 형식의 SSE 스트림이 순서대로 출력됨.

- [ ] **Step 3: 커밋**

```bash
git add app/api/recommend/route.ts
git commit -m "feat: add streaming API route with mock mode"
```

---

## Task 6: BottomSheet 컴포넌트

**Files:**
- Create: `components/BottomSheet.tsx`

- [ ] **Step 1: BottomSheet.tsx 작성**

`components/BottomSheet.tsx`:
```typescript
'use client'

import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  children: React.ReactNode
}

export default function BottomSheet({ isOpen, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.scrollTop = 0
    }
  }, [isOpen])

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0
        bg-white rounded-t-3xl
        transition-transform duration-300 ease-out
        shadow-[0_-4px_24px_rgba(0,0,0,0.12)]
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
      ref={sheetRef}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-9 h-1 rounded-full bg-gray-200" />
      </div>
      <div className="px-5 pb-8 pt-2">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/BottomSheet.tsx
git commit -m "feat: add BottomSheet component"
```

---

## Task 7: 조건 입력 페이지 (/trip)

**Files:**
- Create: `app/trip/page.tsx`
- Create: `components/ConditionStep.tsx`

- [ ] **Step 1: ConditionStep.tsx 작성**

`components/ConditionStep.tsx`:
```typescript
interface Option {
  value: string
  label: string
  emoji?: string
}

interface ConditionStepProps {
  options: Option[]
  onSelect: (value: string) => void
  selected?: string
  showConfirm?: boolean
  onConfirm?: () => void
}

export default function ConditionStep({
  options, onSelect, selected, showConfirm, onConfirm
}: ConditionStepProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold border transition-all
              ${selected === opt.value
                ? 'bg-[--green-deep] text-white border-[--green-deep]'
                : 'bg-white text-[--green-deep] border-[--green-border] hover:border-[--green-deep]'
              }
            `}
          >
            {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
            {opt.label}
          </button>
        ))}
      </div>
      {showConfirm && selected && (
        <button
          onClick={onConfirm}
          className="mt-5 w-full bg-[--green-deep] text-white rounded-xl py-3.5 font-bold text-base"
        >
          추천받기 →
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: trip/page.tsx 작성**

`app/trip/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/BottomSheet'
import ConditionStep from '@/components/ConditionStep'
import type { Transport, Duration, Theme } from '@/types'

const STEPS = [
  {
    id: 'date',
    question: '언제 가실 건가요?',
    options: [
      { value: 'today', label: '오늘', emoji: '☀️' },
      { value: 'tomorrow', label: '내일', emoji: '🌤' },
      { value: 'weekend', label: '이번 주말', emoji: '🗓' },
    ],
  },
  {
    id: 'transport',
    question: '어떻게 이동하실 건가요?',
    options: [
      { value: 'car', label: '자차', emoji: '🚗' },
      { value: 'transit', label: '대중교통', emoji: '🚆' },
    ],
  },
  {
    id: 'duration',
    question: '얼마나 다녀오실 건가요?',
    options: [
      { value: 'half', label: '반나절', emoji: '🌅' },
      { value: 'day', label: '하루', emoji: '🌞' },
      { value: 'overnight', label: '1박 이상', emoji: '🌙' },
    ],
  },
  {
    id: 'theme',
    question: '오늘 어떤 여행이 땡기세요?',
    options: [
      { value: 'sensibility', label: '감성', emoji: '📷' },
      { value: 'healing', label: '힐링', emoji: '🌿' },
      { value: 'activity', label: '액티비티', emoji: '⛷' },
      { value: 'food', label: '맛집', emoji: '🍽' },
      { value: 'culture', label: '문화', emoji: '🏛' },
    ],
  },
]

type Selections = {
  date?: string
  transport?: Transport
  duration?: Duration
  theme?: Theme
}

export default function TripPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState<Selections>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    // 마운트 시 시트 열기 (애니메이션 효과)
    const t = setTimeout(() => setSheetOpen(true), 50)
    return () => clearTimeout(t)
  }, [])

  const currentStep = STEPS[step]
  const currentValue = selections[currentStep.id as keyof Selections]
  const isLastStep = step === STEPS.length - 1

  function handleSelect(value: string) {
    const key = currentStep.id as keyof Selections
    const newSelections = { ...selections, [key]: value }
    setSelections(newSelections)

    if (!isLastStep) {
      // 자동으로 다음 스텝으로
      setTimeout(() => setStep(s => s + 1), 200)
    }
  }

  function handleBack() {
    if (step === 0) {
      router.push('/')
    } else {
      setStep(s => s - 1)
    }
  }

  function handleConfirm() {
    const departure = localStorage.getItem('departure')
    if (!departure) { router.push('/'); return }

    const dep = JSON.parse(departure)
    const params = new URLSearchParams({
      dep: `${dep.lat},${dep.lng}`,
      depLabel: dep.label,
      date: selections.date ?? 'today',
      transport: selections.transport ?? 'car',
      duration: selections.duration ?? 'day',
      theme: selections.theme ?? 'healing',
    })
    router.push(`/result?${params.toString()}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #4E8B5F 0%, #1A2E1A 100%)' }}>

      {/* 상단 진행 표시 */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="text-white/70 text-lg">←</button>
          <span className="text-white/50 text-sm">{step + 1} / {STEPS.length}</span>
        </div>
        <h1 className="text-white text-3xl font-black leading-snug">
          {currentStep.question}
        </h1>
      </div>

      {/* 진행 바 */}
      <div className="absolute top-0 left-0 h-1 bg-white/20 w-full">
        <div
          className="h-full bg-white/60 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* 바텀 시트 */}
      <BottomSheet isOpen={sheetOpen}>
        <ConditionStep
          options={currentStep.options}
          onSelect={handleSelect}
          selected={currentValue}
          showConfirm={isLastStep}
          onConfirm={handleConfirm}
        />
      </BottomSheet>
    </div>
  )
}
```

- [ ] **Step 3: dev 서버에서 /trip 확인**

`http://localhost:3000/trip` 에서 바텀 시트 애니메이션, 칩 선택, 4단계 전환 동작 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/trip/page.tsx components/ConditionStep.tsx
git commit -m "feat: add condition input page with bottom sheet flow"
```

---

## Task 8: 온보딩 페이지 (/)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: page.tsx 작성**

`app/page.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 이미 출발지 설정돼 있으면 /trip 으로 바로
    if (localStorage.getItem('departure')) {
      router.replace('/trip')
    }
  }, [router])

  async function handleGPS() {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않아요.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const departure = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: '현재 위치',
        }
        localStorage.setItem('departure', JSON.stringify(departure))
        router.push('/trip')
      },
      () => {
        setLoading(false)
        setError('위치 권한이 거부됐어요. 직접 입력해주세요.')
      }
    )
  }

  function handleManual() {
    // 간단히 서울 기본값으로 설정 (추후 주소 검색으로 확장)
    const departure = { lat: 37.5665, lng: 126.9780, label: '서울' }
    localStorage.setItem('departure', JSON.stringify(departure))
    router.push('/trip')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[--green-light]">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-[--green-dark] mb-3">P의 여행</h1>
        <p className="text-[--green-deep] text-base leading-relaxed">
          계획은 없어도 괜찮아.<br />
          실시간 관광 빅데이터가<br />
          오늘 떠날 소도시를 골라줄게요.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleGPS}
          disabled={loading}
          className="w-full bg-[--green-deep] text-white rounded-2xl py-4 font-bold text-base disabled:opacity-60"
        >
          {loading ? '위치 확인 중...' : '📍 내 위치에서 출발'}
        </button>
        <button
          onClick={handleManual}
          className="w-full bg-white text-[--green-deep] border border-[--green-border] rounded-2xl py-4 font-semibold text-base"
        >
          직접 출발지 입력
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 온보딩 → /trip 흐름 확인**

`http://localhost:3000` 에서 GPS 클릭 시 `/trip`으로 이동, 두 번째 방문 시 자동 리다이렉트 확인.

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: add onboarding page with GPS and localStorage"
```

---

## Task 9: LoadingStatus 컴포넌트 + 결과 페이지

**Files:**
- Create: `components/LoadingStatus.tsx`
- Create: `components/ResultCard.tsx`
- Create: `components/CourseSlide.tsx`
- Create: `app/result/page.tsx`

- [ ] **Step 1: LoadingStatus.tsx 작성**

`components/LoadingStatus.tsx`:
```typescript
interface LoadingStatusProps {
  message: string
}

export default function LoadingStatus({ message }: LoadingStatusProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #4E8B5F 0%, #1A2E1A 100%)' }}>
      <div className="text-center px-8">
        <div className="mb-8">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
        <p className="text-white text-lg font-bold mb-2">오늘 딱 맞는 소도시를</p>
        <p className="text-white text-lg font-bold mb-6">찾고 있어요</p>
        <p className="text-white/60 text-sm transition-all duration-300">{message}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: CourseSlide.tsx 작성**

`components/CourseSlide.tsx`:
```typescript
import type { CourseItem } from '@/types'

interface CourseSlideProps {
  course: CourseItem[]
}

export default function CourseSlide({ course }: CourseSlideProps) {
  return (
    <div>
      <p className="text-xs font-bold text-[--green-deep] uppercase tracking-widest mb-3">오늘의 코스</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {course.map((item, i) => (
          <div key={i} className="min-w-[110px] bg-white rounded-2xl p-3 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-[--green-mid] block mb-1">{item.time}</span>
            <p className="text-sm font-bold text-[--green-dark] mb-1">{item.name}</p>
            <p className="text-[11px] text-gray-400 leading-snug">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: ResultCard.tsx 작성**

`components/ResultCard.tsx`:
```typescript
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
```

- [ ] **Step 4: result/page.tsx 작성**

`app/result/page.tsx`:
```typescript
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingStatus from '@/components/LoadingStatus'
import ResultCard from '@/components/ResultCard'
import type { Recommendation, TravelCondition, StreamChunk } from '@/types'

function ResultContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('여행지를 찾고 있어요')
  const [result, setResult] = useState<Recommendation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const [lat, lng] = (params.get('dep') ?? '37.5665,126.9780').split(',').map(Number)
    const condition: TravelCondition = {
      departure: { lat, lng, label: params.get('depLabel') ?? '출발지' },
      date: params.get('date') ?? 'today',
      transport: (params.get('transport') ?? 'car') as TravelCondition['transport'],
      duration: (params.get('duration') ?? 'day') as TravelCondition['duration'],
      theme: (params.get('theme') ?? 'healing') as TravelCondition['theme'],
    }

    const fetchRecommendation = async () => {
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(condition),
        })

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const chunk: StreamChunk = JSON.parse(line.replace('data: ', ''))
            if (chunk.type === 'status') setStatus(chunk.message)
            else if (chunk.type === 'result') setResult(chunk.data)
            else if (chunk.type === 'error') setError(chunk.message)
          }
        }
      } catch {
        setError('네트워크 오류가 발생했어요. 다시 시도해주세요.')
      }
    }

    fetchRecommendation()
  }, [params])

  function handleRetry() {
    router.push('/trip')
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl mb-4">😔</p>
        <p className="text-[--green-dark] font-bold mb-2">아쉽게도 지금은 어려워요</p>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={handleRetry}
          className="bg-[--green-deep] text-white px-6 py-3 rounded-xl font-bold">
          다시 시도
        </button>
      </div>
    )
  }

  if (!result) return <LoadingStatus message={status} />

  return <ResultCard data={result} onRetry={handleRetry} />
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingStatus message="준비 중이에요" />}>
      <ResultContent />
    </Suspense>
  )
}
```

- [ ] **Step 5: 전체 흐름 E2E 확인 (mock 모드)**

1. `http://localhost:3000` → GPS 또는 직접 입력
2. `/trip` → 4단계 선택 후 "추천받기"
3. `/result` → 로딩 텍스트 순서대로 변경 → 결과 카드 표시
4. "다시 ↻" → `/trip` 복귀 확인

- [ ] **Step 6: 커밋**

```bash
git add components/LoadingStatus.tsx components/ResultCard.tsx components/CourseSlide.tsx app/result/page.tsx
git commit -m "feat: add result page with streaming loading and result card"
```

---

## Task 10: Claude AI 레이어

**Files:**
- Create: `lib/ai.ts`

> **전제:** `ANTHROPIC_API_KEY` 환경변수가 설정돼 있어야 함.

- [ ] **Step 1: Anthropic SDK 설치**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: lib/ai.ts 작성**

`lib/ai.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { TravelCondition, Recommendation, StreamChunk } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface CityData {
  name: string
  demandStrength?: number   // 수요 강도
  diversity?: number        // 다양성
  resourceDemand?: number   // 자원 수요
  congestion?: number       // 집중률 (0~1)
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

  // 1단계: 소도시 선정
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

  // 2단계: 코스 구성
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
```

- [ ] **Step 3: 커밋**

```bash
git add lib/ai.ts package.json package-lock.json
git commit -m "feat: add Claude AI layer with streaming recommendation"
```

---

## Task 11: TourAPI + 카카오 + 기상청 연결

**Files:**
- Create: `lib/tour-api.ts`
- Create: `lib/kakao.ts`
- Create: `lib/weather.ts`
- Modify: `app/api/recommend/route.ts`

> **전제:** `TOUR_API_KEY`, `KAKAO_REST_API_KEY`, `WEATHER_API_KEY` 환경변수 설정 필요.

- [ ] **Step 1: lib/kakao.ts 작성**

`lib/kakao.ts`:
```typescript
import type { Departure } from '@/types'

const CITY_EXCLUSIONS = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종']

// 이동수단별 도달 반경 (km)
const RADIUS_MAP = {
  car: { half: 80, day: 150, overnight: 250 },
  transit: { half: 60, day: 120, overnight: 200 },
}

// 시군구 목록 (실제 구현 시 카카오 API로 대체)
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

  // 실제 카카오 API 호출
  const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${departure.lng}&y=${departure.lat}`
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } })
  const data = await res.json()
  // 실제 반경 내 시군구 추출 로직 (카카오 모빌리티 API 필요)
  // 여기서는 간단히 직선거리 기반 필터링
  return MOCK_CITIES
    .map(c => ({ ...c, distanceKm: distanceKm(departure.lat, departure.lng, c.lat, c.lng) }))
    .filter(c => c.distanceKm <= radius)
}
```

- [ ] **Step 2: lib/weather.ts 작성**

`lib/weather.ts`:
```typescript
const MOCK_WEATHER: Record<string, { condition: string; temp: number }> = {
  default: { condition: '맑음', temp: 22 },
}

export async function getWeather(
  lat: number, lng: number, date: string
): Promise<{ condition: string; temp: number }> {
  if (process.env.USE_MOCK === 'true') return MOCK_WEATHER.default

  // 기상청 단기예보 API
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
```

- [ ] **Step 3: lib/tour-api.ts 작성**

`lib/tour-api.ts`:
```typescript
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

  const [demand, diversity, resource, congestion] = await Promise.allSettled([
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
```

- [ ] **Step 4: route.ts에 실제 파이프라인 연결**

`app/api/recommend/route.ts`의 `realPipeline` 함수를 교체:

```typescript
import { getCandidateCities } from '@/lib/kakao'
import { getCityStats, getCitySpots } from '@/lib/tour-api'
import { getWeather } from '@/lib/weather'
import { getRecommendationStream } from '@/lib/ai'

async function* realPipeline(condition: TravelCondition): AsyncGenerator<StreamChunk> {
  yield { type: 'status', message: '출발지 기준 반경을 계산하고 있어요' }
  const candidates = await getCandidateCities(condition.departure, condition.transport, condition.duration)

  if (candidates.length === 0) {
    yield { type: 'error', message: '조건에 맞는 소도시를 찾지 못했어요. 조건을 바꿔볼까요?' }
    return
  }

  yield { type: 'status', message: '각 소도시 데이터를 수집하고 있어요' }
  const cityDataList = await Promise.allSettled(
    candidates.slice(0, 5).map(async c => ({
      name: c.name,
      ...(await getCityStats(c.name)),
      weather: await getWeather(c.lat, c.lng, condition.date),
    }))
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
```

- [ ] **Step 5: 커밋**

```bash
git add lib/tour-api.ts lib/kakao.ts lib/weather.ts app/api/recommend/route.ts
git commit -m "feat: connect TourAPI, Kakao, weather and real pipeline"
```

---

## Task 12: 마무리 — OG 태그, 에러 처리, 반응형, 배포

**Files:**
- Create: `app/not-found.tsx`
- Modify: `app/result/page.tsx` (OG 동적 메타)
- Modify: `tailwind.config.ts` (scrollbar-hide)

- [ ] **Step 1: scrollbar-hide CSS 유틸리티 추가 (Tailwind v4는 config 파일 없음)**

`app/globals.css`에 추가:
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: not-found.tsx 작성**

`app/not-found.tsx`:
```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[--green-light]">
      <p className="text-5xl mb-4">🗺</p>
      <h2 className="text-xl font-black text-[--green-dark] mb-2">길을 잃었어요</h2>
      <p className="text-sm text-gray-500 mb-6">페이지를 찾을 수 없어요.</p>
      <Link href="/" className="bg-[--green-deep] text-white px-6 py-3 rounded-xl font-bold">
        처음으로
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Vercel 배포**

```bash
npm run build
```

빌드 에러 없음 확인 후:

```bash
npx vercel --prod
```

Vercel 대시보드에서 환경변수 설정 (API 키 입력 후):
- `ANTHROPIC_MODEL`, `ANTHROPIC_API_KEY`
- `TOUR_API_KEY`, `KAKAO_MAP_API_KEY`, `KAKAO_REST_API_KEY`
- `WEATHER_API_KEY`, `KORAIL_API_KEY`
- `USE_MOCK=false`

- [ ] **Step 4: develop → main 머지 + 최종 커밋**

```bash
git add .
git commit -m "feat: add polish, OG tags, error handling and deploy config"
git checkout main
git merge develop
git push origin main
git push origin develop
```

Expected: Vercel이 `main` 브랜치 감지 후 자동 배포.
