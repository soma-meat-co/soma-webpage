import { Reveal } from "@/components/Reveal";

interface Stat {
  num: string;
  label: string;
}

interface StatBandProps {
  stats: Stat[];
  bgClassName?: string;
}

export function StatBand({ stats, bgClassName = "bg-soma-red" }: StatBandProps) {
  return (
    <Reveal>
      <div
        className={`${bgClassName} flex items-center justify-center`}
        style={{ padding: "clamp(20px, 4vw, 28px) clamp(8px, 6vw, 80px)" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 min-w-0 text-center relative"
            style={{ padding: "0 clamp(4px, 2vw, 40px)" }}
          >
            {i < stats.length - 1 && (
              <span className="absolute right-0 top-[20%] bottom-[20%] w-[1px] bg-white/30" />
            )}
            <div
              className="font-display font-bold text-white leading-none"
              style={{ fontSize: "clamp(18px, 5vw, 40px)" }}
            >
              {s.num}
            </div>
            <div
              className="font-label font-medium uppercase text-white/75 mt-1 truncate"
              style={{ fontSize: "clamp(7px, 1.6vw, 11px)", letterSpacing: "clamp(0.05em, 0.3vw, 0.2em)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
