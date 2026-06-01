import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[--cream]">
      <p className="text-5xl mb-4">🗺</p>
      <h2 className="text-xl font-black text-[--ink] mb-2">길을 잃었어요</h2>
      <p className="text-sm text-[--muted] mb-6">페이지를 찾을 수 없어요.</p>
      <Link href="/" className="bg-[--sage] text-white px-6 py-3 rounded-xl font-bold transition-colors hover:bg-[--sage-dark]">
        처음으로
      </Link>
    </div>
  )
}
