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
