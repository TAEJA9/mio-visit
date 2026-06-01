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
        <p className="text-white text-lg font-medium mb-2">오늘 딱 맞는 소도시를</p>
        <p className="text-white text-lg font-medium mb-6">찾고 있어요</p>
        <p className="text-white/60 text-sm transition-all duration-300">{message}</p>
      </div>
    </div>
  )
}
