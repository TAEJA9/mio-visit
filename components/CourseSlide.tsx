import type { CourseItem } from '@/types'

interface CourseSlideProps {
  course: CourseItem[]
}

export default function CourseSlide({ course }: CourseSlideProps) {
  return (
    <div>
      <p className="text-xs font-bold text-[--sage-dark] uppercase tracking-widest mb-3">오늘의 코스</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {course.map((item, i) => (
          <div key={i} className="min-w-[140px] bg-white border border-[--border] rounded-lg p-4 flex-shrink-0">
            <span className="text-[10px] font-bold text-[--sage-dark] block mb-2">{item.time}</span>
            <p className="text-sm font-medium text-[--ink] mb-1">{item.name}</p>
            <p className="text-[11px] text-[--muted] leading-snug">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
