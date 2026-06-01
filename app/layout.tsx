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
        <div className="min-h-screen bg-[--cream]">
          <div className="w-full mx-auto min-h-screen bg-[--cream]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
