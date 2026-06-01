'use client'

interface Option {
  value: string
  label: string
  emoji?: string
}

interface ConditionStepProps {
  options: Option[]
  onSelect: (value: string) => void
  selected?: string
}

export default function ConditionStep({
  options, onSelect, selected
}: ConditionStepProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === opt.value
              ? 'bg-[--sage] text-white'
              : 'text-[--ink] hover:bg-[--border]'
          }`}
        >
          {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
