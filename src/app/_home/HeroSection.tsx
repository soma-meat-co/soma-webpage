"use client";

import { motion } from "framer-motion";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

const badges = [
  { title: "Certificación TIF", sub: "Tipo Inspección Federal" },
  { title: "HACCP", sub: "Certificado para Exportación" },
  { title: "Kosher", sub: "Proceso Certificado" },
  { title: "Halal", sub: "Proceso Certificado" },
];

export function HeroSection() {
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay },
  });

  return (
    <section
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{ padding: "120px 80px 80px" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 70% 50%, rgba(172,31,37,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(60,36,21,0.5) 0%, transparent 60%),
            linear-gradient(160deg, #0D0B09 0%, #1a100a 40%, #0D0B09 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(172,31,37,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(172,31,37,0.06) 1px, transparent 1px)
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

      <div className="relative z-[2] max-w-[780px]">
        <motion.div {...fadeUp(0.2)} className="flex items-center gap-3 mb-7">
          <span className="block w-10 h-[1px] bg-soma-red" />
          <span className="font-label text-[12px] font-semibold tracking-[0.25em] uppercase text-soma-red">
            Teoloyucan, Estado de México — Industria TIF
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.4)}
          className="font-display font-semibold leading-none text-white mb-6"
          style={{ fontSize: "clamp(52px, 7vw, 96px)" }}
        >
          20 Años de{" "}
          <em className="text-soma-red not-italic">Excelencia</em>
          <br />
          en la Industria Cárnica
        </motion.h1>

        <motion.p
          {...fadeUp(0.6)}
          className="text-[17px] font-light leading-[1.7] text-soma-gray-lt max-w-[540px] mb-12"
        >
          Planta industrial certificada TIF con HACCP para exportación. Procesamos,
          cortamos y maquilamos carne premium bajo los estándares internacionales más
          exigentes — con certificación Kosher y Halal.
        </motion.p>

        <motion.div {...fadeUp(0.8)} className="flex gap-4 flex-wrap">
          <a
            href="#servicios"
            className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-soma-red border-2 border-soma-red px-9 py-4 rounded-sm hover:bg-transparent hover:text-soma-red transition-all duration-200 no-underline"
          >
            Conocer Servicios
          </a>
          <a
            href="#certificaciones"
            className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/25 px-9 py-4 rounded-sm hover:border-white transition-all duration-200 no-underline"
          >
            Nuestras Certificaciones
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute right-20 top-1/2 -translate-y-1/2 z-[2] hidden lg:flex flex-col gap-4"
      >
        {badges.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-3.5 px-[22px] py-3.5 rounded-sm border border-soma-red/40 backdrop-blur-sm bg-white/[0.04] hover:border-soma-red hover:bg-soma-red/[0.08] transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-soma-red flex items-center justify-center flex-shrink-0">
              <ShieldIcon />
            </div>
            <div className="font-label">
              <strong className="block text-[15px] font-bold tracking-[0.05em] text-white">
                {b.title}
              </strong>
              <span className="text-[11px] font-normal text-soma-gray tracking-[0.08em] uppercase">
                {b.sub}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2"
      >
        <span className="font-label text-[10px] tracking-[0.2em] text-soma-gray uppercase">
          Scroll
        </span>
        <div
          className="w-[1px] h-12"
          style={{
            background: "linear-gradient(180deg, #AC1F25 0%, transparent 100%)",
            animation: "scrollPulse 2s infinite",
          }}
        />
      </motion.div>
    </section>
  );
}
