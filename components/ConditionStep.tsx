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
              px-4 py-2 rounded-full text-sm font-medium border transition-all
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
          className="mt-5 w-full bg-[--green-deep] text-white rounded-xl py-3.5 font-medium text-base"
        >
          추천받기 →
        </button>
      )}
    </div>
  )
}
