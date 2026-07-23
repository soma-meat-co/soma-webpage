import { Fragment } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import SectionDivider from "@/components/ui/SectionDivider";

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
    imagen: "/camara-kosher.jpeg",
    desc: "Sacrificio bajo los protocolos del Tipo Inspección Federal. Inspección veterinaria oficial permanente en línea, trazabilidad completa del animal y cumplimiento estricto de normativa SENASICA-SAGARPA.",
    specs: [
      { title: "Inspección Veterinaria", body: "Médico veterinario oficial en planta durante todo el proceso de sacrificio." },
      { title: "Trazabilidad Total", body: "Registro de origen del animal, número de lote y destino en cada canal procesada." },
      { title: "Normativa SENASICA", body: "Cumplimiento de NOM-033-SAG/ZOO-2014 para sacrificio humanitario." },
      { title: "Capacidad de Proceso", body: "Línea bovinos, porcinos, ovinos y aves bajo el mismo estándar TIF." },
    ],
  },
  {
    num: "02",
    id: "deshuese",
    title: "Deshuese y Corte",
    subtitle: "Precisión en Cada Canal",
    imagen: "/corte-deshuese.png",
    desc: "Corte especializado de canales con estándares de precisión para el sector restaurantero, hotelero y de supermercados. Cortes gourmet o industriales a especificación exacta del cliente.",
    specs: [
      { title: "Cortes Premium", body: "Rack, lomo, pierna, paleta y cortes especiales a especificación del cliente." },
      { title: "Pesaje Exacto", body: "Porciones controladas por peso con tolerancia mínima para el sector retail." },
      { title: "Temperatura Controlada", body: "Sala de deshuese a temperatura inferior a 7°C durante todo el proceso." },
      { title: "Especificación a Medida", body: "Cualquier corte, peso o presentación según los requerimientos del comprador." },
    ],
  },
  {
    num: "03",
    id: "maquila",
    title: "Maquila de Carne",
    subtitle: "Su Marca, Nuestro Proceso",
    imagen: "/maquila.png",
    desc: "Servicio de maquila bajo marca propia del cliente. Procesamos, cortamos y preparamos conforme a sus especificaciones técnicas, con trazabilidad total y certificación TIF en cada lote.",
    specs: [
      { title: "Bajo Tu Marca", body: "Procesamos y empacamos con la marca y etiqueta de su empresa." },
      { title: "Especificación Técnica", body: "Seguimos su ficha técnica al pie de la letra en cada lote producido." },
      { title: "Certificado por Lote", body: "Certificado TIF individual por número de lote para trazabilidad completa." },
      { title: "Flexibilidad de Volumen", body: "Desde lotes pequeños de prueba hasta producciones industriales de alto volumen." },
    ],
  },
  {
    num: "04",
    id: "empaque",
    title: "Empaque y Etiquetado",
    subtitle: "Presentación para Cualquier Mercado",
    imagen: "/empacado.png",
    desc: "Empaque al vacío, en atmósfera modificada o a granel. Etiquetado conforme a normativa NOM para mercado nacional o con especificaciones de exportación para mercados internacionales.",
    specs: [
      { title: "Vacío y MAP", body: "Empaque al vacío y en atmósfera modificada para máxima vida de anaquel." },
      { title: "Etiquetado NOM", body: "Cumplimiento total con NOM-051 para mercado nacional y exportación." },
      { title: "Cadena de Frío", body: "Documentación de temperatura en cada etapa desde proceso hasta entrega." },
      { title: "Exportación Ready", body: "Documentación sanitaria y certificados para importación en mercados internacionales." },
    ],
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
    <main className="bg-soma-off-wh text-soma-black">
      {/* Page Hero */}
      <div className="relative flex items-end overflow-hidden h-[25vh] md:h-[40vh] min-h-[260px] px-4 pb-5 pt-20 sm:px-10 sm:pb-8 sm:pt-24 md:px-20 md:pb-10 md:pt-28">
        <Image
          src="/servicios-hero.png"
          alt="SOMA MEAT CO"
          fill
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: "linear-gradient(90deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.6) 40%, rgba(13,11,9,0.15) 75%, transparent 100%)" }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px] z-[2]"
          style={{ background: "linear-gradient(180deg, transparent, #AC1F25 20%, #AC1F25 80%, transparent)" }}
        />
        <div className="absolute top-4 left-12 z-[3] max-w-[760px]">
          <div className="flex items-center gap-3 mb-2 sm:mb-4 ">
            <span className="block w-8 h-[1px] bg-white" />
            <span className="font-label text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white">
              TIF 845 — Planta Certificada
            </span>
          </div>
          <h1
            className="font-display font-semibold text-white leading-none mb-2 sm:mb-5"
            style={{ fontSize: "clamp(28px, 5vw, 56px)", textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            Servicios <em className="text-soma-red not-italic">TIF</em>
          </h1>
          <p className="hidden sm:block text-[14px] md:text-[16px] font-light leading-[1.6] md:leading-[1.75] text-white max-w-[560px]">
            Capacidad industrial completa bajo un solo techo certificado — desde el rastro
            hasta el empaque final, con la flexibilidad de una operación de maquila a medida.
          </p>
        </div>
      </div>

      {/* Service anchors */}
      <div className="sticky top-[72px] z-50 backdrop-blur-sm bg-soma-red flex overflow-x-auto px-4 sm:px-10 md:px-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {services.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="font-label sm:tracking-[0.12em] uppercase text-white/75 hover:text-white border-b-2 border-transparent hover:border-white/60 transition-all duration-200 flex items-center gap-2 no-underline whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4 md:px-7"
            style={{ fontSize: "clamp(8px, 1vw, 14px)"}}
          >
            {s.num} {s.title}
          </a>
        ))}
      </div>

      {/* Service blocks */}
      {services.map((svc, idx) => (
        <Fragment key={svc.id}>
        <section
          id={svc.id}
          className="relative bg-soma-off-wh px-6 py-16 sm:px-10 sm:py-20 md:px-20 md:py-[100px]"
        >
          <span
            className="hidden md:block absolute pointer-events-none select-none font-display font-bold leading-none"
            style={{
              fontSize: "160px",
              color: "rgba(172,31,37,0.05)",
              top: 60,
              [idx % 2 === 0 ? "right" : "left"]: 80,
            }}
          >
            {svc.num}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center max-w-[1300px] mx-auto">
            {/* Text side */}
            <div className={`order-2 ${idx % 2 === 1 ? "md:order-2" : "md:order-1"}`}>
              <Reveal>
                <div className="flex items-center gap-3 mb-3 sm:mb-3.5">
                  <span className="block w-7 h-[2px] bg-soma-red" />
                  <span className="font-label text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-soma-red">
                    {svc.subtitle}
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2
                  className="font-display font-semibold text-soma-black leading-[1.1] mb-4 sm:mb-5"
                  style={{ fontSize: "clamp(28px, 4vw, 50px)" }}
                >
                  {svc.title}
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-[14px] sm:text-[15px] font-light leading-[1.7] sm:leading-[1.8] text-[#555] mb-6 sm:mb-8">
                  {svc.desc}
                </p>
              </Reveal>
              <div className="flex flex-col gap-3 sm:gap-3.5">
                {svc.specs.map((spec, si) => (
                  <Reveal key={spec.title} delay={0.1 * (si + 2)}>
                    <div className="flex flex-col gap-0.5 px-4 py-3 sm:px-5 sm:py-4 bg-white border border-soma-black/[0.08] rounded-sm shadow-sm transition-colors duration-200 hover:border-soma-red/40">
                      <h4 className="font-label text-[12px] sm:text-[13px] font-bold tracking-[0.06em] uppercase text-soma-black mb-0.5">{spec.title}</h4>
                      <p className="text-[12px] sm:text-[13px] text-[#666] leading-snug">{spec.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Visual side */}
            <Reveal delay={0.2} direction="left" className={`order-1 ${idx % 2 === 1 ? "md:order-1" : "md:order-2"}`}>
              <div className="rounded-sm flex flex-col justify-end p-6 sm:p-8 md:p-10 relative overflow-hidden h-[240px] sm:h-[340px] md:h-[460px]" style={{ background: "#3C2415" }}>
                <Image
                  src={svc.imagen}
                  alt={svc.title}
                  fill
                  className="object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(0deg, rgba(13,11,9,0.95) 0%, rgba(13,11,9,0.7) 14%, rgba(13,11,9,0.15) 25%, transparent 40%)`,
                  }}
                />
                <div
                  className="hidden sm:block absolute top-6 right-6 font-display font-bold leading-none select-none pointer-events-none"
                  style={{ fontSize: "100px", color: "rgba(172,31,37,0.12)" }}
                >
                  {svc.num}
                </div>
                <div className="relative z-[1]">
                  <h3 className="font-display text-[22px] sm:text-[28px] md:text-[32px] font-semibold text-white mb-2">{svc.title}</h3>
                  <div className="w-10 h-0.5 bg-soma-red mb-3" />
                  <p className="font-label text-[11px] sm:text-[12px] tracking-[0.12em] uppercase text-soma-gray">
                    Certificado TIF 422 · HACCP
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        {idx < services.length - 1 && <SectionDivider />}
        </Fragment>
      ))}

      {/* CTA */}
      <div className="bg-soma-red relative overflow-hidden flex items-center justify-between gap-8 md:gap-16 flex-col md:flex-row px-6 py-12 sm:px-10 md:px-20 md:py-20">
        <div className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-black/10 pointer-events-none" />
        <div className="relative z-[1] text-center md:text-left">
          <h2 className="font-display font-semibold text-white leading-[1.1] mb-3 sm:mb-4" style={{ fontSize: "clamp(26px, 3.5vw, 46px)" }}>
            ¿Listo Para Solicitar una Cotización?
          </h2>
          <p className="text-[14px] sm:text-[16px] font-light text-white/85 leading-[1.6] sm:leading-[1.65] max-w-[480px]">
            Cuéntenos sus necesidades y le preparamos una propuesta personalizada en menos de 24 horas.
          </p>
        </div>
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center relative z-[1] flex-shrink-0">
          <a
            href="/cotizacion"
            className="font-label text-[12px] sm:text-[13px] font-bold tracking-[0.1em] sm:tracking-[0.12em] uppercase text-soma-red bg-white border-2 border-white px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:bg-transparent hover:text-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Cotizar Ahora
          </a>
          <a
            href="mailto:contacto@somameat.com"
            className="font-label text-[12px] sm:text-[13px] font-semibold tracking-[0.1em] sm:tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/40 px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:border-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Enviar Correo
          </a>
        </div>
      </div>
    </main>
  );
}
