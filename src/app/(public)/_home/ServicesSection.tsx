import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { SectionEyebrow } from "./SectionEyebrow";
import { withBasePath } from "@/lib/basePath";

const services = [
  {
    num: "01",
    title: "Rastro TIF",
    body: "Sacrificio bajo los protocolos del Tipo Inspección Federal. Inspección veterinaria oficial en línea, trazabilidad completa y cumplimiento de normativa SENASICA.",
    imagen: "/rastro-tif.jpeg",
  },
  {
    num: "02",
    title: "Deshuese y Corte",
    body: "Corte especializado de canales con estándares de precisión para el sector restaurantero, hotelero y de supermercados. Cortes gourmet o industriales a especificación del cliente.",
    imagen: "/corte-deshuese.png",
  },
  {
    num: "03",
    title: "Maquila de Carne",
    body: "Servicio de maquila bajo marca propia del cliente. Procesamos, cortamos y preparamos conforme a sus especificaciones, con trazabilidad total y certificación TIF en cada lote.",
    imagen: "/maquila.png",
  },
  {
    num: "04",
    title: "Empaque y Etiquetado",
    body: "Empaque al vacío, en atmósfera modificada o a granel. Etiquetado conforme a normativa NOM para mercado nacional o con especificaciones de exportación internacional.",
    imagen: "/empacado.png",
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-white" style={{ padding: "100px 80px" }}>
      <Reveal>
        <SectionEyebrow>Nuestros Servicios</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-soma-black mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Capacidad Industrial
          <br />
          Completa en Un Solo Lugar
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-[#555] max-w-[540px] mb-[60px]">
          Desde el rastro hasta el empaque final, ofrecemos la cadena completa de
          procesamiento bajo certificación TIF — con la flexibilidad de una operación de
          maquila a la medida de sus necesidades.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-[60px]">
        {services.map((svc, i) => (
          <Reveal key={svc.num} delay={0.1 * i}>
            <div className="group bg-white border border-soma-black/[0.08] rounded-sm overflow-hidden shadow-sm hover:border-soma-red hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b-4 border-soma-red">
                <Image
                  src={withBasePath(svc.imagen)}
                  alt={svc.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className="absolute top-3 left-4 font-display font-bold leading-none text-soma-red select-none"
                  style={{ fontSize: "40px", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                >
                  {svc.num}
                </span>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-display text-[22px] font-semibold text-soma-black mb-3 leading-[1.2]">
                  {svc.title}
                </h3>
                <div className="w-8 h-0.5 bg-soma-red mb-5" />
                <p className="text-[14px] text-[#666] leading-[1.7]">{svc.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
