# P의 여행 리디자인 — Implementation Plan

> **스펙:** `docs/superpowers/specs/2026-06-01-p-travel-redesign.md`
> **목표:** 바텀 시트 모바일 패턴 제거 → 에디토리얼 웹 스타일 (크림/세이지, 사이드바+패널)
> **유지:** `lib/` 전체, `app/api/`, `types/index.ts`, `lib/mock-data.ts`

---

## File Map

| 파일 | 작업 |
|------|------|
| `app/globals.css` | CSS 변수 교체 (green → cream/sage) |
| `app/layout.tsx` | max-w 제거, bg-cream |
| `app/page.tsx` | 히어로 랜딩으로 재작성 |
| `app/trip/page.tsx` | 사이드바+패널 레이아웃으로 전면 재작성 |
| `app/result/page.tsx` | **삭제** (/trip에 통합) |
| `components/Sidebar.tsx` | **신규** — 조건 입력 사이드바 |
| `components/RightPanel.tsx` | **신규** — idle/loading/result 패널 |
| `components/ConditionStep.tsx` | 사이드바용 라디오 UI로 재작성 |
| `components/LoadingStatus.tsx` | 인라인 로딩으로 재작성 (풀스크린 제거) |
| `components/ResultCard.tsx` | 패널 레이아웃으로 재작성 |
| `components/CourseSlide.tsx` | 유지 |
| `components/BottomSheet.tsx` | **삭제** |

---

## Task 1: CSS 변수 + 글로벌 스타일 교체

**Files:** `app/globals.css`

- [ ] `globals.css`에서 기존 `--green-*` 변수 전부 제거
- [ ] 새 변수 추가:
  ```css
  :root {
    --cream: #FAF8F4;
    --sidebar: #F2EDE4;
    --sage: #87A88A;
    --sage-dark: #5C8060;
    --ink: #1C1C1C;
    --muted: #6B6B6B;
    --border: #E4DDD4;
  }
  ```
- [ ] `body` 스타일: `background: var(--cream); color: var(--ink);`
- [ ] 커밋: `"refactor: replace green palette with cream/sage editorial palette"`

---

## Task 2: layout.tsx 정리

**Files:** `app/layout.tsx`

- [ ] 외부 wrapper: `min-h-screen bg-[--cream]`
- [ ] 내부 컨테이너: `w-full mx-auto min-h-screen bg-[--cream]` (max-w 없음, 풀 와이드)
- [ ] `shadow-xl` 제거
- [ ] 커밋: `"refactor: remove max-width constraint from layout"`

---

## Task 3: 랜딩 페이지 재작성

**Files:** `app/page.tsx`

- [ ] 풀스크린 히어로, `bg-[--cream]`, 세로 중앙 정렬
- [ ] `<h1>` "P의 여행" — `text-6xl font-black text-[--ink]`
- [ ] 설명 문구 — `font-normal text-[--muted]`
- [ ] CTA 버튼 "지금 떠나볼까요 →" — `bg-[--sage] text-white rounded-full px-8 py-4 font-medium`
- [ ] 호버: `bg-[--sage-dark]`
- [ ] `localStorage.departure` 있으면 `/trip` 자동 리다이렉트
- [ ] 버튼 클릭 → `/trip`
- [ ] 커밋: `"feat: rewrite landing page with editorial hero style"`

---

## Task 4: BottomSheet 삭제 + result 페이지 삭제

**Files:** `components/BottomSheet.tsx`, `app/result/page.tsx`

- [ ] `components/BottomSheet.tsx` 삭제
- [ ] `app/result/` 디렉토리 삭제
- [ ] 커밋: `"refactor: remove BottomSheet and standalone result page"`

---

## Task 5: LoadingStatus 재작성 (인라인)

**Files:** `components/LoadingStatus.tsx`

- [ ] 풀스크린 그라데이션 배경 제거
- [ ] 패널 내 인라인 로딩 UI:
  ```tsx
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <div className="w-8 h-8 border-2 border-[--border] border-t-[--sage] rounded-full animate-spin" />
    <p className="text-[--muted] text-sm">{message}</p>
  </div>
  ```
- [ ] 커밋: `"refactor: LoadingStatus to inline panel variant"`

---

## Task 6: ConditionStep 재작성 (사이드바용)

**Files:** `components/ConditionStep.tsx`

바텀 시트용 칩 버튼 → 사이드바용 라디오 리스트 스타일

- [ ] Props 유지: `options`, `onSelect`, `selected`
- [ ] 각 옵션: 라디오 버튼 느낌의 행 레이아웃
  ```tsx
  <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
    ${selected === opt.value
      ? 'bg-[--sage] text-white'
      : 'text-[--ink] hover:bg-[--border]'
    }`}>
    {opt.emoji} {opt.label}
  </button>
  ```
- [ ] `showConfirm`/`onConfirm` props 제거 (추천받기 버튼은 Sidebar에서 처리)
- [ ] 커밋: `"refactor: ConditionStep to sidebar radio list style"`

---

## Task 7: ResultCard 재작성 (패널용)

**Files:** `components/ResultCard.tsx`

풀스크린 카드 → 패널 내 스크롤 레이아웃

- [ ] `min-h-screen` 제거, `h-full overflow-y-auto`로 변경
- [ ] 히어로 영역: `h-48` (줄임), 그라데이션 배경 유지
- [ ] 소도시명: `text-4xl font-black text-[--ink]` (흰색 → 잉크)
- [ ] 히어로 아래로 분리: 배경 그라데이션 히어로 + 본문은 `bg-[--cream]`
- [ ] 인포 칩: `bg-white border border-[--border]`로 변경
- [ ] CTA 버튼: `bg-[--sage]`, 다시 버튼: `border border-[--border] text-[--ink]`
- [ ] 커밋: `"refactor: ResultCard to panel-fit layout"`

---

## Task 8: Sidebar 컴포넌트 신규 작성

**Files:** `components/Sidebar.tsx`

```tsx
interface SidebarProps {
  selections: Selections
  onSelect: (key: string, value: string) => void
  onSubmit: () => void
  departure: string
}
```

- [ ] 배경 `bg-[--sidebar]`, `w-72 flex-shrink-0 h-screen sticky top-0 overflow-y-auto`
- [ ] 상단: "P의 여행" 로고 (작게) + 출발지 표시
- [ ] 섹션별 ConditionStep 렌더링 (날짜, 이동수단, 기간, 테마)
- [ ] 각 섹션 레이블: `text-xs font-medium text-[--muted] uppercase tracking-widest`
- [ ] 섹션 구분선: `border-t border-[--border]`
- [ ] 하단 "추천받기" 버튼: `w-full bg-[--sage] text-white rounded-xl py-3 font-medium`
  - 모든 조건 선택 전: `opacity-50 cursor-not-allowed`
- [ ] 커밋: `"feat: add Sidebar component for condition input"`

---

## Task 9: RightPanel 컴포넌트 신규 작성

**Files:** `components/RightPanel.tsx`

```tsx
type PanelState = 'idle' | 'loading' | 'result'

interface RightPanelProps {
  state: PanelState
  loadingMessage?: string
  result?: Recommendation
  onRetry: () => void
}
```

- [ ] `idle`: 중앙에 `"왼쪽에서 조건을 선택하고\n추천받기를 눌러보세요"` (--muted)
- [ ] `loading`: `<LoadingStatus message={loadingMessage} />`
- [ ] `result`: `<ResultCard data={result} onRetry={onRetry} />`
- [ ] 배경 `bg-[--cream]`, `flex-1 h-screen overflow-y-auto`
- [ ] 커밋: `"feat: add RightPanel component with idle/loading/result states"`

---

## Task 10: trip/page.tsx 전면 재작성

**Files:** `app/trip/page.tsx`

- [ ] 기존 바텀 시트 로직 전부 제거
- [ ] 레이아웃:
  ```tsx
  <div className="flex min-h-screen">
    <Sidebar ... />
    <RightPanel ... />
  </div>
  ```
- [ ] state: `selections`, `panelState`, `loadingMessage`, `result`
- [ ] `handleSubmit`: SSE fetch → `panelState: 'loading'` → 청크 파싱 → `panelState: 'result'`
  - 기존 `app/result/page.tsx`의 SSE 스트림 파싱 로직 이식
- [ ] 모바일: `flex-col` (사이드바 위, 패널 아래)
- [ ] `npx tsc --noEmit` 통과 확인
- [ ] 커밋: `"feat: rewrite trip page with sidebar+panel layout"`

---

## Task 11: 빌드 확인 + 정리

- [ ] `npm run build` 통과 확인
- [ ] 삭제된 파일 import 참조 없는지 확인
- [ ] `git push origin develop`
- [ ] 커밋: (빌드 에러 있을 시 수정 커밋 추가)
