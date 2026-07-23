import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Catálogo de Cordero Premium — SOMA MEAT CO | TIF 422",
  description: "Catálogo de cortes de cordero premium certificados TIF 422. Canal entera, pierna, rack, costillar y más. Disponibles con certificación Kosher y Halal.",
};

const cuts = [
  {
    category: "Canal",
    items: [
      { name: "Canal Entera", weight: "8–16 kg", desc: "Canal completa lista para frío o deshuese. Inspección veterinaria incluida.", tag: "TIF · Kosher · Halal" },
      { name: "Media Canal", weight: "4–8 kg", desc: "Media canal delantera o trasera. Opción práctica para restaurantes.", tag: "TIF" },
    ],
  },
  {
    category: "Pierna y Paleta",
    items: [
      { name: "Pierna", weight: "1.5–3 kg", desc: "Pierna entera con hueso. Corte estrella para barbacoa y asados de alta cocina.", tag: "Premium" },
      { name: "Paleta con Hueso", weight: "1–2 kg", desc: "Paleta completa con hueso, ideal para cocción lenta y braseados.", tag: "Popular" },
      { name: "Paleta sin Hueso", weight: "700g–1.5 kg", desc: "Paleta desosada lista para rellenar, empacar al vacío o porcionada.", tag: "Chef's Cut" },
    ],
  },
  {
    category: "Costillar",
    items: [
      { name: "Rack / Frenched", weight: "600g–1.2 kg", desc: "Rack de cordero frenched. Presentación premium para restaurantes de alta gama.", tag: "Premium" },
      { name: "Costillar Completo", weight: "700g–1.5 kg", desc: "Costillar completo para parrilla o horno. Excelente proporción carne/hueso.", tag: "Gourmet" },
    ],
  },
  {
    category: "Lomo y Especialidades",
    items: [
      { name: "Lomo", weight: "400–800g", desc: "Lomo de cordero, el corte más magro y tierno. Perfecto para medallones.", tag: "Premium" },
      { name: "Chamorro", weight: "300–600g", desc: "Chamorro delantero o trasero, ideal para cocción lenta y caldos.", tag: "Clásico" },
      { name: "Cuello", weight: "400–700g", desc: "Cuello entero o en rodajas. Base perfecta para caldos y guisos.", tag: "Tradicional" },
      { name: "A Especificación", weight: "Personalizado", desc: "Cualquier corte, peso o presentación según sus requerimientos específicos.", tag: "Custom" },
    ],
  },
];

const species = [
  { icon: "🐑", name: "Cordero", sub: "Ovino" },
  { icon: "🐂", name: "Res", sub: "Bovino" },
  { icon: "🐖", name: "Cerdo", sub: "Porcino" },
  { icon: "🐓", name: "Pollo", sub: "Ave" },
];

export default function CatalogoPage() {
  return (
    <main className="bg-soma-black text-soma-off-wh">
      {/* Page Hero */}
      <div
        className="min-h-[58vh] flex items-end relative overflow-hidden"
        style={{ padding: "80px", paddingTop: "160px" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(13,11,9,.94) 0%, rgba(13,11,9,.65) 55%, rgba(172,31,37,.15) 100%), linear-gradient(160deg, #1a100a 0%, #0D0B09 100%)",
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px] z-[2]"
          style={{ background: "linear-gradient(180deg,transparent,#AC1F25 20%,#AC1F25 80%,transparent)" }}
        />
        <div className="relative z-[3] max-w-[720px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-[1px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
              TIF 422 · Kosher · Halal
            </span>
          </div>
          <h1
            className="font-display font-semibold text-white leading-none mb-5"
            style={{ fontSize: "clamp(40px, 6vw, 78px)" }}
          >
            Catálogo de{" "}
            <em className="text-soma-red not-italic">Cordero Premium</em>
          </h1>
          <p className="text-[16px] font-light leading-[1.75] text-soma-gray-lt max-w-[540px]">
            Todos los cortes disponibles bajo certificación TIF 422. Canal entera, piezas primarias
            y cortes especializados para cada segmento de mercado.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: "Catálogo" }]} />

      {/* Species note */}
      <div className="bg-white/[0.02] border-b border-white/[0.06]" style={{ padding: "24px 80px" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-label text-[11px] tracking-[0.2em] uppercase text-soma-gray mr-2">
            Disponible en:
          </span>
          {species.map((s) => (
            <div key={s.name} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-sm bg-white/[0.03] hover:border-soma-red/40 transition-colors">
              <span className="text-lg">{s.icon}</span>
              <div>
                <span className="font-label text-[13px] font-bold tracking-[0.05em] uppercase text-white">{s.name}</span>
                <span className="font-label text-[10px] tracking-[0.08em] uppercase text-soma-gray ml-1.5">{s.sub}</span>
              </div>
            </div>
          ))}
          <span className="font-label text-[11px] tracking-[0.1em] uppercase text-soma-gray ml-2">
            · Todos con certificación TIF 422
          </span>
        </div>
      </div>

      {/* Catalog by category */}
      <div style={{ padding: "80px 80px" }}>
        {cuts.map((section, si) => (
          <div key={section.category} className="mb-16 last:mb-0">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-0.5 bg-soma-red flex-shrink-0" />
                <h2 className="font-label text-[13px] font-bold tracking-[0.2em] uppercase text-soma-red">
                  {section.category}
                </h2>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>
            </Reveal>

            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {section.items.map((item, ii) => (
                <Reveal key={item.name} delay={0.08 * ii}>
                  <div className="group border border-white/[0.08] rounded-sm p-6 bg-white/[0.02] hover:border-soma-red/50 hover:bg-soma-red/[0.04] transition-all duration-300 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display text-[22px] font-semibold text-white leading-tight">
                        {item.name}
                      </h3>
                      <span
                        className="font-label text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 border rounded-sm flex-shrink-0 mt-1"
                        style={{ color: "#AC1F25", borderColor: "rgba(172,31,37,0.4)", background: "rgba(172,31,37,0.08)" }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-4">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-soma-red flex-shrink-0" aria-hidden>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                      <span className="font-label text-[11px] tracking-[0.08em] uppercase text-soma-gray">
                        {item.weight}
                      </span>
                    </div>
                    <p className="text-[13px] text-soma-gray leading-relaxed flex-1">{item.desc}</p>
                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {["TIF", "HACCP"].map((c) => (
                          <span key={c} className="font-label text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 border border-soma-red/30 text-soma-gray/70 rounded-sm">
                            {c}
                          </span>
                        ))}
                      </div>
                      <a
                        href="/cotizacion"
                        className="font-label text-[10px] font-bold tracking-[0.1em] uppercase text-soma-red hover:underline no-underline transition-all"
                      >
                        Cotizar →
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom cuts note */}
      <Reveal>
        <div
          className="mx-[80px] mb-[80px] flex items-center gap-8 p-8 rounded-sm border"
          style={{ background: "rgba(172,31,37,0.06)", borderColor: "rgba(172,31,37,0.3)" }}
        >
          <div className="w-14 h-14 bg-soma-red rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-[24px] font-semibold text-white mb-1.5">¿Necesita un Corte Especial?</h3>
            <p className="text-[14px] text-soma-gray-lt leading-relaxed">
              Si su pedido requiere un corte, peso o presentación que no aparece en este catálogo,
              contáctenos. Procesamos a especificación del cliente bajo certificación TIF.
            </p>
          </div>
          <a
            href="/cotizacion"
            className="font-label text-[12px] font-bold tracking-[0.12em] uppercase bg-soma-red text-white px-7 py-3.5 rounded-sm hover:bg-soma-red-dk transition-colors no-underline whitespace-nowrap flex-shrink-0"
          >
            Solicitar Corte
          </a>
        </div>
      </Reveal>

      {/* Cert badges */}
      <div className="bg-soma-brown" style={{ padding: "56px 80px" }}>
        <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { cert: "TIF 422", sub: "Tipo Inspección Federal", body: "Máximo estándar de calidad e inocuidad en la industria cárnica mexicana." },
            { cert: "HACCP", sub: "Para Exportación", body: "Sistema de análisis de peligros habilitado para mercados internacionales." },
            { cert: "Kosher", sub: "Supervisión Rabínica", body: "Proceso bajo supervisión rabínica certificada en todo el ciclo." },
            { cert: "Halal", sub: "Ley Islámica", body: "Procesamiento conforme a los principios y requisitos de la ley islámica." },
          ].map((c) => (
            <Reveal key={c.cert}>
              <div className="text-center">
                <div className="inline-flex w-14 h-14 rounded-full bg-soma-red/20 border-2 border-soma-red items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-soma-red" aria-hidden>
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                </div>
                <div className="font-display text-[20px] font-semibold text-white mb-0.5">{c.cert}</div>
                <div className="font-label text-[10px] tracking-[0.15em] uppercase text-soma-red mb-2">{c.sub}</div>
                <p className="text-[13px] text-soma-gray leading-relaxed">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
