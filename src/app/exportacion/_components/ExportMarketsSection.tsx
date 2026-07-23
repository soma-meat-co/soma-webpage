import { Reveal } from "@/components/Reveal";
import { exportMarkets } from "../_data";

export function ExportMarketsSection() {
  return (
    <section className="bg-soma-off-wh text-soma-black px-4 py-16 sm:px-10 sm:py-20 md:px-20 md:py-24">
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-7 h-[2px] bg-soma-red" />
          <span className="font-label text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-soma-red">Global Reach</span>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-semibold text-soma-black leading-[1.1] mb-4 sm:mb-5" style={{ fontSize: "clamp(28px, 4vw, 56px)" }}>
          Markets We Serve
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-[60px]">
        {exportMarkets.map((m, i) => (
          <Reveal key={m.country} delay={0.08 * i}>
            <div className="flex items-center gap-4 p-4 sm:p-5 bg-white border-t-[3px] border-soma-red shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <span className="text-3xl sm:text-4xl">{m.flag}</span>
              <div>
                <div className="font-label text-[14px] sm:text-[15px] font-bold tracking-[0.05em] uppercase text-soma-brown">{m.country}</div>
                <div className="text-[12px] sm:text-[13px] text-[#666]">{m.sub}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
