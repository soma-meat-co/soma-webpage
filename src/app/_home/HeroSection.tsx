"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function HeroSection() {
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay },
  });

  return (
    <section
      className="flex flex-col justify-start relative overflow-hidden px-6 pt-8 sm:pt-16 pb-16 md:px-20 md:pt-[120px] md:pb-20"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 70% 50%, rgba(172,31,37,0.05) 0%, transparent 70%),
            linear-gradient(160deg, #FFFFFF 0%, #FAFAFA 40%, #FFFFFF 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(172,31,37,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(172,31,37,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px]"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #AC1F25 20%, #AC1F25 80%, transparent 100%)",
        }}
      />

      <div className="relative z-[2] w-full mx-auto text-center lg:text-left">
        <motion.div {...fadeUp(0.2)} className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-5">
          <span className="block w-6 sm:w-10 h-[1px] bg-soma-red shrink-0" />
          <span className="font-label text-[10px] sm:text-[12px] font-semibold tracking-[0.15em] sm:tracking-[0.25em] uppercase text-soma-red">
            Teoloyucan, Estado de México — Industria TIF
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.4)}
          className="font-display font-semibold leading-none text-soma-black mb-6"
          style={{ fontSize: "clamp(30px, 7vw, 96px)" }}
        >
          20 Años de{" "}
          <em className="text-soma-red not-italic">Excelencia</em>
          <br />
          en la Industria Cárnica
        </motion.h1>
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-sm overflow-hidden mb-8">
          <Image
            src="/heroImage845.jpeg"
            alt="SOMA MEAT CO"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        <motion.p
          {...fadeUp(0.6)}
          className="text-[17px] font-light leading-[1.7] text-gray-600 max-w-[540px] mx-auto lg:mx-0"
        >
          Planta industrial certificada TIF con HACCP para exportación. Procesamos,
          cortamos y maquilamos carne premium bajo los estándares internacionales más
          exigentes — con certificación Kosher y Halal.
        </motion.p>

        <motion.div {...fadeUp(0.8)} className="mt-8 flex flex-wrap sm:flex-nowrap gap-4 justify-center lg:justify-start">
          <a
            href="#servicios"
            className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-soma-red border-2 border-soma-red px-9 py-4 rounded-sm hover:bg-transparent hover:text-soma-red transition-all duration-200 no-underline flex-shrink-0 md:flex-shrink-1"
          >
            Conocer Servicios
          </a>
          <a
            href="#certificaciones"
            className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-soma-black bg-transparent border-2 border-soma-black/15 px-9 py-4 rounded-sm hover:border-soma-black transition-all duration-200 no-underline flex-shrink-0 md:flex-shrink-1"
          >
            Nuestras Certificaciones
          </a>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
