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
            <p className="text-sm font-medium text-[--green-dark] mb-1">{item.name}</p>
            <p className="text-[11px] text-gray-400 leading-snug">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
