import { cn } from "@/lib/utils";

interface SelectCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SelectCard({ selected, onClick, children, className }: SelectCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative border-2 rounded-sm p-3 sm:p-4 cursor-pointer transition-all duration-200",
        selected
          ? "border-soma-red bg-soma-red/10"
          : "border-soma-black/10 bg-white hover:border-soma-black/20",
        className
      )}
    >
      {selected && (
        <span className="absolute top-2 right-3 font-bold text-[14px] text-soma-red">✓</span>
      )}
      {children}
    </div>
  );
}
