export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-8 h-[2px] bg-soma-red flex-shrink-0" />
      <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
        {children}
      </span>
    </div>
  );
}
