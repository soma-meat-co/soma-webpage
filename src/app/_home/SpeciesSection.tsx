import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const species = [
  { emoji: "🐂", label: "Bovino", name: "Res", desc: "Cortes premium, canales y maquila para todos los mercados.", bg: "#3C2415" },
  { emoji: "🐖", label: "Porcino", name: "Cerdo", desc: "Procesamiento completo bajo estándares TIF.", bg: "#2a1a10" },
  { emoji: "🐑", label: "Ovino", name: "Cordero", desc: "Especialistas en cordero para mercado Kosher y Halal.", bg: "#1e1408" },
  { emoji: "🐓", label: "Ave", name: "Pollo", desc: "Línea avícola con los mismos estándares de inocuidad.", bg: "#140e05" },
];

export function SpeciesSection() {
  return (
    <section className="bg-[#111008]" style={{ padding: "100px 80px 0" }}>
      <Reveal>
        <SectionEyebrow>Especies que Procesamos</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-white mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Capacidad Integral
          <br />
          en Cuatro Especies
        </h2>
      </Reveal>

      <div className="grid gap-0.5 mt-[60px]" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {species.map((s, i) => (
          <Reveal key={s.name} delay={0.1 * i}>
            <div
              className="relative overflow-hidden flex flex-col justify-end p-8 px-6"
              style={{ background: s.bg, aspectRatio: "3/4" }}
            >
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)" }}
              />
              <div className="absolute top-0 left-0 right-0 bottom-[60%] flex items-center justify-center text-[72px]">
                {s.emoji}
              </div>
              <div className="relative z-[1]">
                <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-red mb-1">
                  {s.label}
                </div>
                <div className="font-display text-[28px] font-semibold text-white leading-[1.1]">
                  {s.name}
                </div>
                <div className="text-[13px] text-soma-gray mt-2 leading-[1.5]">{s.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
