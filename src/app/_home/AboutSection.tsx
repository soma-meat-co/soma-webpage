import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const pillars = [
  {
    title: "Misión",
    body: "Ofrecer servicios de procesamiento cárnico con los más altos estándares de calidad, garantizando inocuidad y trazabilidad para el mercado nacional e internacional.",
  },
  {
    title: "Planta Certificada TIF",
    body: "Operamos bajo la estricta normativa del Tipo Inspección Federal, con todos los procesos auditados y documentados conforme a la regulación SENASICA-SAGARPA.",
  },
  {
    title: "Ubicación Estratégica",
    body: "Instalados en Teoloyucan, Estado de México — conectados con los principales centros de distribución, rastros y mercados del país.",
  },
];

export function AboutSection() {
  return (
    <section
      id="nosotros"
      className="bg-soma-off-wh text-soma-black grid items-center gap-20"
      style={{ padding: "100px 80px", gridTemplateColumns: "1fr 1fr" }}
    >
      <div>
        <Reveal>
          <SectionEyebrow>Quiénes Somos</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            className="font-display font-semibold leading-[1.1] text-soma-black mb-5"
            style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
          >
            Respaldados por Dos Décadas de Operación
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[16px] font-light leading-[1.75] text-[#555] max-w-[540px] mb-[60px]">
            SOMA MEAT CO es el resultado de más de 20 años de trayectoria ininterrumpida
            en la industria cárnica mexicana. Nacimos con el compromiso de elevar los
            estándares de calidad, inocuidad y trazabilidad en cada etapa del proceso.
          </p>
        </Reveal>
        <div className="flex flex-col gap-6">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={0.1 * (i + 3)}>
              <div className="flex items-start gap-4">
                <div className="w-[3px] bg-soma-red rounded-sm flex-shrink-0 self-stretch min-h-4" />
                <div>
                  <h4 className="font-label text-[14px] font-bold tracking-[0.08em] uppercase text-soma-brown mb-1">
                    {p.title}
                  </h4>
                  <p className="text-[14px] text-[#666] leading-[1.6]">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.2} direction="left">
        <div className="relative h-[500px]">
          <div
            className="absolute inset-0 rounded-sm flex flex-col justify-end p-10 overflow-hidden"
            style={{ background: "#3C2415" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 70%, rgba(172,31,37,0.4) 0%, transparent 60%),
                  linear-gradient(160deg, #3C2415 0%, #1e1009 100%)
                `,
              }}
            />
            <div
              className="absolute top-[30px] right-[30px] font-display font-bold leading-none select-none"
              style={{ fontSize: "120px", color: "rgba(172,31,37,0.15)" }}
            >
              20
            </div>
            <div className="relative z-[1]">
              <h3 className="font-display text-[38px] font-semibold text-white mb-2">
                Desde 2005
              </h3>
              <p className="font-label text-[13px] tracking-[0.15em] uppercase text-soma-gray">
                Operando con los más altos estándares
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
