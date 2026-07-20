import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const certs = [
  {
    title: "Certificación TIF",
    body: "Tipo Inspección Federal — el sello máximo de calidad e inocuidad en la industria cárnica mexicana. Garantiza inspección veterinaria permanente, trazabilidad del animal y cumplimiento de normativa oficial.",
    tag: "SENASICA · SAGARPA",
    
  },
  {
    title: "HACCP",
    body: "Hazard Analysis and Critical Control Points — sistema internacional de análisis de peligros y puntos críticos de control. Habilitación para exportación a mercados internacionales con los más altos requisitos sanitarios.",
    tag: "Habilitado para Exportación",

  },
  {
    title: "Kosher",
    body: "Proceso de sacrificio y procesamiento bajo supervisión rabínica certificada. Habilitados para abastecer a la comunidad judía y exportar a mercados que requieren certificación Kosher.",
    tag: "Supervisión Rabínica Certificada",

  },
  {
    title: "Halal",
    body: "Procesamiento bajo los principios y requisitos de la ley islámica. Certificación que abre mercados en países de mayoría musulmana y comunidades Halal a nivel internacional.",
    tag: "Cumplimiento Ley Islámica",

  },
];

export function CertificationsSection() {
  return (
    <section
      id="certificaciones"
      className="relative bg-soma-off-wh px-6 py-16 md:px-20 md:py-[100px]"
    >
      <Reveal>
        <SectionEyebrow>Garantía de Calidad</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-soma-black mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Certificaciones que
          <br />
          Abren Mercados
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-[#555] max-w-[540px] mb-[60px]">
          Nuestras certificaciones no son solo documentos — son el resultado de procesos
          auditados, personal capacitado y una cultura de inocuidad que atraviesa cada
          etapa de producción.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-[60px]">
        {certs.map((c, i) => (
          <Reveal key={c.title} delay={0.1 * i}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 p-6 sm:p-10 bg-white border border-soma-black/[0.08] rounded-sm shadow-sm hover:border-soma-red/60 transition-all duration-300">
              <div className="w-16 h-16 flex-shrink-0 rounded-full bg-soma-red/10 border-2 border-soma-red flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-soma-red" aria-hidden>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-[24px] font-semibold text-soma-black mb-2">{c.title}</h3>
                <p className="text-[14px] text-[#666] leading-[1.65]">{c.body}</p>
                <span className="inline-block mt-3 font-label text-[10px] font-bold tracking-[0.15em] uppercase text-soma-red border border-soma-red px-2.5 py-1 rounded-sm">
                  {c.tag}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
