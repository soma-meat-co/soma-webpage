import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const markets = [
  {
    title: "Restaurantes y Hoteles",
    body: "Cortes gourmet a la medida. Atendemos las exigencias de la alta cocina con cortes premium, porciones exactas y consistencia de calidad en cada entrega.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
      </svg>
    ),
  },
  {
    title: "Supermercados y Tiendas",
    body: "Abasto constante con empaque al vacío, etiquetado NOM y presentaciones estandarizadas para anaquel. Cadena de frío documentada desde planta hasta punto de venta.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.46 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    title: "Exportación Internacional",
    body: "Habilitados con HACCP para exportación. Documentación sanitaria, certificados de origen y cumplimiento de requisitos de importación para mercados internacionales.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
        <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
      </svg>
    ),
  },
  {
    title: "Comunidad Kosher",
    body: "Planta certificada para proceso Kosher bajo supervisión rabínica. Cumplimos con todos los requisitos de la ley judía para el procesamiento de carne.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    ),
  },
];

export function MarketsSection() {
  return (
    <section id="productos" className="bg-soma-off-wh text-soma-black" style={{ padding: "100px 80px" }}>
      <Reveal>
        <SectionEyebrow>A Quién Servimos</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-soma-black mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Cuatro Mercados,
          <br />
          Un Solo Estándar
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-[#555] max-w-[540px] mb-[60px]">
          Nuestra capacidad instalada y certificaciones nos permiten atender a una amplia
          variedad de clientes — desde chefs de alta cocina hasta importadores internacionales.
        </p>
      </Reveal>

      <div className="grid gap-6 mt-[60px]" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {markets.map((m, i) => (
          <Reveal key={m.title} delay={0.1 * i}>
            <div className="border-t-[3px] border-soma-red p-8 px-6 bg-white shadow-sm hover:shadow-[0_8px_32px_rgba(172,31,37,0.12)] hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="w-11 h-11 bg-soma-red/10 rounded-sm flex items-center justify-center mb-5">
                {m.icon}
              </div>
              <h3 className="font-label text-[16px] font-bold tracking-[0.05em] uppercase text-soma-brown mb-2.5">
                {m.title}
              </h3>
              <p className="text-[14px] text-[#666] leading-[1.65]">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
