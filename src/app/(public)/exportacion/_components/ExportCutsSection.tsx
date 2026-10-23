import { Reveal } from "@/components/Reveal";
import { exportCuts } from "../_data";

export function ExportCutsSection() {
  return (
    <section className="px-4 py-16 sm:px-10 sm:py-20 md:px-20 md:py-24">
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-7 h-[2px] bg-soma-red" />
          <span className="font-label text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-soma-red">Product Catalog</span>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-semibold text-white leading-[1.1] mb-4 sm:mb-5" style={{ fontSize: "clamp(28px, 4vw, 56px)" }}>
          Premium Cuts for Export
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[14px] sm:text-[16px] font-light leading-[1.7] sm:leading-[1.75] text-soma-gray max-w-[540px] mb-10 sm:mb-[60px]">
          All cuts are processed and packed at our TIF 422 facility. Vacuum or MAP packaging,
          custom labeling, and full export documentation available.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {exportCuts.map((cut, i) => (
          <Reveal key={cut.name} delay={0.08 * i}>
            <div className="border border-white/[0.08] rounded-sm p-5 sm:p-6 bg-white/[0.02] hover:border-soma-red/50 hover:bg-soma-red/[0.04] transition-all duration-300">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-display text-[18px] sm:text-[20px] font-semibold text-white leading-tight">{cut.name}</h3>
                <span className="font-label text-[9px] sm:text-[10px] tracking-[0.08em] uppercase text-soma-red border border-soma-red/40 px-2 py-0.5 rounded-sm flex-shrink-0 mt-0.5 whitespace-nowrap">{cut.weight}</span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-soma-gray leading-relaxed">{cut.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
