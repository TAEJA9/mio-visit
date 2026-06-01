interface LoadingStatusProps {
  message: string
}

export default function LoadingStatus({ message }: LoadingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-8 h-8 border-2 border-[--border] border-t-[--sage] rounded-full animate-spin" />
      <p className="text-[--muted] text-sm text-center transition-all duration-300">{message}</p>
    </div>
  )
}
