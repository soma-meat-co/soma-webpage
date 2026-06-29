import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const services = [
  {
    num: "01",
    title: "Rastro TIF",
    body: "Sacrificio bajo los protocolos del Tipo Inspección Federal. Inspección veterinaria oficial en línea, trazabilidad completa y cumplimiento de normativa SENASICA.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Deshuese y Corte",
    body: "Corte especializado de canales con estándares de precisión para el sector restaurantero, hotelero y de supermercados. Cortes gourmet o industriales a especificación del cliente.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
        <path d="M7 17.013l4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58z" />
        <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Maquila de Carne",
    body: "Servicio de maquila bajo marca propia del cliente. Procesamos, cortamos y preparamos conforme a sus especificaciones, con trazabilidad total y certificación TIF en cada lote.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Empaque y Etiquetado",
    body: "Empaque al vacío, en atmósfera modificada o a granel. Etiquetado conforme a normativa NOM para mercado nacional o con especificaciones de exportación internacional.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
        <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        <path d="M20 5H4l2-3h12l2 3z" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-soma-black" style={{ padding: "100px 80px" }}>
      <Reveal>
        <SectionEyebrow>Nuestros Servicios</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-white mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Capacidad Industrial
          <br />
          Completa en Un Solo Lugar
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-soma-gray max-w-[540px] mb-[60px]">
          Desde el rastro hasta el empaque final, ofrecemos la cadena completa de
          procesamiento bajo certificación TIF — con la flexibilidad de una operación de
          maquila a la medida de sus necesidades.
        </p>
      </Reveal>

      <div className="grid gap-0.5 mt-[60px]" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {services.map((svc, i) => (
          <Reveal key={svc.num} delay={0.1 * i}>
            <div className="group bg-white/[0.03] border border-white/[0.07] p-10 px-8 relative overflow-hidden hover:border-soma-red hover:bg-soma-red/[0.05] transition-all duration-300 h-full">
              <span
                className="absolute top-4 right-5 font-display font-bold leading-none text-white/[0.04] group-hover:text-soma-red/20 transition-colors duration-300 select-none"
                style={{ fontSize: "72px" }}
              >
                {svc.num}
              </span>
              <div className="w-12 h-12 bg-soma-red rounded-sm flex items-center justify-center mb-6">
                {svc.icon}
              </div>
              <h3 className="font-display text-[22px] font-semibold text-white mb-3 leading-[1.2]">
                {svc.title}
              </h3>
              <div className="w-8 h-0.5 bg-soma-red my-5" />
              <p className="text-[14px] text-soma-gray leading-[1.7]">{svc.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
