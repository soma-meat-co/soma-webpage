import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Servicios TIF — SOMA MEAT CO | Rastro · Corte · Maquila · Empaque",
  description: "Planta TIF 422 con capacidad industrial completa: rastro, deshuese, maquila y empaque bajo estándares internacionales HACCP, Kosher y Halal.",
};

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-7 h-[2px] bg-soma-red flex-shrink-0" />
      <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
        {children}
      </span>
    </div>
  );
}

const services = [
  {
    num: "01",
    id: "rastro",
    title: "Rastro TIF",
    subtitle: "Sacrificio Certificado",
    desc: "Sacrificio bajo los protocolos del Tipo Inspección Federal. Inspección veterinaria oficial permanente en línea, trazabilidad completa del animal y cumplimiento estricto de normativa SENASICA-SAGARPA.",
    specs: [
      { title: "Inspección Veterinaria", body: "Médico veterinario oficial en planta durante todo el proceso de sacrificio." },
      { title: "Trazabilidad Total", body: "Registro de origen del animal, número de lote y destino en cada canal procesada." },
      { title: "Normativa SENASICA", body: "Cumplimiento de NOM-033-SAG/ZOO-2014 para sacrificio humanitario." },
      { title: "Capacidad de Proceso", body: "Línea bovinos, porcinos, ovinos y aves bajo el mismo estándar TIF." },
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    num: "02",
    id: "deshuese",
    title: "Deshuese y Corte",
    subtitle: "Precisión en Cada Canal",
    desc: "Corte especializado de canales con estándares de precisión para el sector restaurantero, hotelero y de supermercados. Cortes gourmet o industriales a especificación exacta del cliente.",
    specs: [
      { title: "Cortes Premium", body: "Rack, lomo, pierna, paleta y cortes especiales a especificación del cliente." },
      { title: "Pesaje Exacto", body: "Porciones controladas por peso con tolerancia mínima para el sector retail." },
      { title: "Temperatura Controlada", body: "Sala de deshuese a temperatura inferior a 7°C durante todo el proceso." },
      { title: "Especificación a Medida", body: "Cualquier corte, peso o presentación según los requerimientos del comprador." },
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
        <path d="M7 17.013l4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58z" />
        <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z" />
      </svg>
    ),
  },
  {
    num: "03",
    id: "maquila",
    title: "Maquila de Carne",
    subtitle: "Su Marca, Nuestro Proceso",
    desc: "Servicio de maquila bajo marca propia del cliente. Procesamos, cortamos y preparamos conforme a sus especificaciones técnicas, con trazabilidad total y certificación TIF en cada lote.",
    specs: [
      { title: "Bajo Tu Marca", body: "Procesamos y empacamos con la marca y etiqueta de su empresa." },
      { title: "Especificación Técnica", body: "Seguimos su ficha técnica al pie de la letra en cada lote producido." },
      { title: "Certificado por Lote", body: "Certificado TIF individual por número de lote para trazabilidad completa." },
      { title: "Flexibilidad de Volumen", body: "Desde lotes pequeños de prueba hasta producciones industriales de alto volumen." },
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  {
    num: "04",
    id: "empaque",
    title: "Empaque y Etiquetado",
    subtitle: "Presentación para Cualquier Mercado",
    desc: "Empaque al vacío, en atmósfera modificada o a granel. Etiquetado conforme a normativa NOM para mercado nacional o con especificaciones de exportación para mercados internacionales.",
    specs: [
      { title: "Vacío y MAP", body: "Empaque al vacío y en atmósfera modificada para máxima vida de anaquel." },
      { title: "Etiquetado NOM", body: "Cumplimiento total con NOM-051 para mercado nacional y exportación." },
      { title: "Cadena de Frío", body: "Documentación de temperatura en cada etapa desde proceso hasta entrega." },
      { title: "Exportación Ready", body: "Documentación sanitaria y certificados para importación en mercados internacionales." },
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
        <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        <path d="M20 5H4l2-3h12l2 3z" />
      </svg>
    ),
  },
];

const certStats = [
  { num: "20", label: "Años de Operación Continua" },
  { num: "4", label: "Especies Procesadas" },
  { num: "4", label: "Certificaciones Activas" },
  { num: "TIF", label: "Tipo Inspección Federal" },
];

export default function ServiciosPage() {
  return (
    <main className="bg-soma-black text-soma-off-wh">
      {/* Page Hero */}
      <div
        className="min-h-[60vh] flex items-end relative overflow-hidden"
        style={{ padding: "80px 80px 80px", paddingTop: "160px" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(110deg, rgba(13,11,9,.93) 0%, rgba(13,11,9,.65) 55%, rgba(172,31,37,.18) 100%),
              linear-gradient(160deg, #1a100a 0%, #0D0B09 100%)
            `,
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px] z-[2]"
          style={{ background: "linear-gradient(180deg, transparent, #AC1F25 20%, #AC1F25 80%, transparent)" }}
        />
        <div className="relative z-[3] max-w-[760px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-[1px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
              TIF 422 — Planta Certificada
            </span>
          </div>
          <h1
            className="font-display font-semibold text-white leading-none mb-5"
            style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
          >
            Servicios <em className="text-soma-red not-italic">TIF</em>
          </h1>
          <p className="text-[16px] font-light leading-[1.75] text-soma-gray-lt max-w-[560px]">
            Capacidad industrial completa bajo un solo techo certificado — desde el rastro
            hasta el empaque final, con la flexibilidad de una operación de maquila a medida.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-soma-brown" style={{ padding: "14px 80px" }}>
        <div className="flex items-center gap-2.5 font-label text-[11px] tracking-[0.12em] uppercase">
          <a href="/" className="text-soma-gray hover:text-soma-red transition-colors">Inicio</a>
          <span className="text-white/30">›</span>
          <span className="text-white font-semibold">Servicios</span>
        </div>
      </div>

      {/* Service anchors */}
      <div
        className="sticky top-[72px] z-50 backdrop-blur-sm border-b border-white/[0.08] flex"
        style={{ background: "rgba(13,11,9,0.92)", padding: "0 80px" }}
      >
        {services.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="font-label text-[12px] font-semibold tracking-[0.12em] uppercase text-soma-gray hover:text-white border-b-2 border-transparent hover:border-soma-red/50 transition-all duration-200 flex items-center gap-2 no-underline"
            style={{ padding: "18px 28px" }}
          >
            {s.num} {s.title}
          </a>
        ))}
      </div>

      {/* Service blocks */}
      {services.map((svc, idx) => (
        <section
          key={svc.id}
          id={svc.id}
          className="relative"
          style={{
            padding: "100px 80px",
            background: idx % 2 === 0 ? "#0D0B09" : "rgba(255,255,255,0.02)",
          }}
        >
          <span
            className="absolute pointer-events-none select-none font-display font-bold leading-none"
            style={{
              fontSize: "160px",
              color: "rgba(172,31,37,0.06)",
              top: 60,
              [idx % 2 === 0 ? "right" : "left"]: 80,
            }}
          >
            {svc.num}
          </span>

          <div
            className="grid gap-20 items-center max-w-[1300px] mx-auto"
            style={{
              gridTemplateColumns: "1fr 1fr",
              direction: idx % 2 === 1 ? "rtl" : "ltr",
            }}
          >
            {/* Text side */}
            <div style={{ direction: "ltr" }}>
              <Reveal>
                <div className="flex items-center gap-3 mb-3.5">
                  <span className="block w-7 h-[2px] bg-soma-red" />
                  <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
                    {svc.subtitle}
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2
                  className="font-display font-semibold text-white leading-[1.1] mb-5"
                  style={{ fontSize: "clamp(32px, 4vw, 50px)" }}
                >
                  {svc.title}
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-[15px] font-light leading-[1.8] text-soma-gray-lt mb-8">
                  {svc.desc}
                </p>
              </Reveal>
              <div className="flex flex-col gap-3.5">
                {svc.specs.map((spec, si) => (
                  <Reveal key={spec.title} delay={0.1 * (si + 2)}>
                    <div className="flex items-start gap-3.5 px-5 py-4 border rounded-sm transition-colors duration-200 hover:border-soma-red/40" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: "rgba(172,31,37,0.15)" }}>
                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-soma-red" aria-hidden>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-label text-[13px] font-bold tracking-[0.06em] uppercase text-white mb-0.5">{spec.title}</h4>
                        <p className="text-[13px] text-soma-gray leading-snug">{spec.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Visual side */}
            <Reveal delay={0.2} direction="left">
              <div
                className="rounded-sm flex flex-col justify-end p-10 relative overflow-hidden"
                style={{ height: "460px", background: "#3C2415" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 40% 60%, rgba(172,31,37,0.35) 0%, transparent 65%), linear-gradient(160deg, #3C2415 0%, #1e1009 100%)`,
                  }}
                />
                <div
                  className="absolute top-6 right-6 font-display font-bold leading-none select-none pointer-events-none"
                  style={{ fontSize: "100px", color: "rgba(172,31,37,0.12)" }}
                >
                  {svc.num}
                </div>
                <div className="relative z-[1]">
                  <div className="w-14 h-14 bg-soma-red rounded-sm flex items-center justify-center mb-5">
                    {svc.icon}
                  </div>
                  <h3 className="font-display text-[32px] font-semibold text-white mb-2">{svc.title}</h3>
                  <div className="w-10 h-0.5 bg-soma-red mb-3" />
                  <p className="font-label text-[12px] tracking-[0.12em] uppercase text-soma-gray">
                    Certificado TIF 422 · HACCP
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* Cert Strip */}
      <div
        className="bg-soma-brown flex items-center justify-center flex-wrap"
        style={{ padding: "48px 80px" }}
      >
        {certStats.map((c, i) => (
          <div
            key={c.label}
            className="flex-1 min-w-[200px] text-center relative"
            style={{ padding: "20px 32px" }}
          >
            {i < certStats.length - 1 && (
              <span className="absolute right-0 top-[15%] bottom-[15%] w-[1px] bg-white/15" />
            )}
            <div className="font-display text-[40px] font-bold text-soma-red leading-none">{c.num}</div>
            <div className="font-label text-[11px] tracking-[0.2em] uppercase text-soma-gray-lt mt-1.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="bg-soma-red relative overflow-hidden flex items-center justify-between gap-16 flex-col md:flex-row"
        style={{ padding: "80px" }}
      >
        <div className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-black/10 pointer-events-none" />
        <div className="relative z-[1]">
          <h2 className="font-display font-semibold text-white leading-[1.1] mb-4" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            ¿Listo Para Solicitar una Cotización?
          </h2>
          <p className="text-[16px] font-light text-white/85 leading-[1.65] max-w-[480px]">
            Cuéntenos sus necesidades y le preparamos una propuesta personalizada en menos de 24 horas.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap relative z-[1] flex-shrink-0">
          <a
            href="/cotizacion"
            className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-soma-red bg-white border-2 border-white px-9 py-4 rounded-sm hover:bg-transparent hover:text-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Cotizar Ahora
          </a>
          <a
            href="mailto:contacto@somameat.com"
            className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/40 px-9 py-4 rounded-sm hover:border-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Enviar Correo
          </a>
        </div>
      </div>
    </main>
  );
}
