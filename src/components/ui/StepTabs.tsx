interface StepTabsProps {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
}

export function StepTabs({ steps, current, onStepClick }: StepTabsProps) {
  return (
    <div className="flex rounded-sm overflow-hidden border border-soma-black/10 bg-white mb-6">
      {steps.map((s, i) => {
        const isCurrent = i === current;
        const isDone = i < current;
        return (
          <div
            key={s}
            onClick={() => isDone && onStepClick?.(i)}
            className={`flex-1 py-2.5 px-1 sm:py-3 sm:px-2 text-center transition-colors duration-200 border-r border-soma-black/10 last:border-r-0 ${
              isCurrent ? "bg-soma-red" : isDone ? "bg-soma-red/15 cursor-pointer" : "bg-transparent"
            }`}
          >
            <div
              className={`font-display text-[16px] sm:text-[18px] font-bold leading-none ${
                isCurrent ? "text-white" : "text-soma-black"
              }`}
            >
              {isDone ? "✓" : i + 1}
            </div>
            <div
              className={`font-label text-[9px] sm:text-[10px] font-semibold tracking-[0.1em] sm:tracking-[0.12em] uppercase mt-1 ${
                isCurrent ? "text-white" : isDone ? "text-soma-red" : "text-soma-gray"
              }`}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
}
