import Image from "next/image";
import { withBasePath } from "@/lib/basePath";

export function QuoteHero() {
  return (
    <div className="relative overflow-hidden bg-soma-off-wh px-4 pt-20 pb-8 sm:px-10 sm:pt-24 sm:pb-10 md:px-20 md:pt-28 md:pb-16 h-[25vh] md:h-[33vh] border-b-[3px] border-soma-black">
      <Image
                src={withBasePath("/servicios-hero.png")}
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
      <div className="absolute top-8 left-6 md:left-8 z-[1] max-w-[680px]">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <span className="block w-7 h-[1px] bg-white" />
          <span className="font-label text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white">
            TIF 845 — Planta Certificada
          </span>
        </div>
        <h1
          className="font-display font-semibold text-white leading-none mb-3 sm:mb-4"
          style={{ fontSize: "clamp(30px, 5vw, 66px)" }}
        >
          Cotiza tu <em className="text-soma-red not-italic">Pedido</em>
        </h1>
        <p className="hidden md:block md:text-[18px] font-light leading-[1.7] md:leading-[1.75] text-white">
          4 pasos · Cotización personalizada · Respuesta el mismo día
        </p>
      </div>
    </div>
  );
}
