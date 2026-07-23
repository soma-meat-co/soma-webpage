export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-[3px] bg-soma-black/10 rounded-sm mb-6 sm:mb-7 overflow-hidden">
      <div
        className="h-full rounded-sm bg-soma-red transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
