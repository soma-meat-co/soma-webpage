"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";

/* ─── Shared helpers ─── */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-8 h-[2px] bg-soma-red flex-shrink-0" />
      <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
        {children}
      </span>
    </div>
  );
}

function WhatsAppIcon({ className = "w-[18px] h-[18px] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.856L.057 23.882l6.19-1.625A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-4.99-1.37l-.357-.212-3.677.964.981-3.585-.233-.368A9.79 9.79 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18c5.42 0 9.82 4.4 9.82 9.82 0 5.42-4.4 9.818-9.82 9.818z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

/* ─── HERO ─── */

function HeroSection() {
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay },
  });

  const badges = [
    { title: "Certificación TIF", sub: "Tipo Inspección Federal" },
    { title: "HACCP", sub: "Certificado para Exportación" },
    { title: "Kosher", sub: "Proceso Certificado" },
    { title: "Halal", sub: "Proceso Certificado" },
  ];

  return (
    <section
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{ padding: "120px 80px 80px" }}
    >
      {/* Background */}
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
      {/* Grid overlay */}
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
      {/* Left deco line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px]"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #AC1F25 20%, #AC1F25 80%, transparent 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-[2] max-w-[780px]">
        <motion.div
          {...fadeUp(0.2)}
          className="flex items-center gap-3 mb-7"
        >
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

      {/* Cert badges — desktop right */}
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

      {/* Scroll indicator */}
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

/* ─── STATS BAND ─── */

function StatsBand() {
  const stats = [
    { num: "20", label: "Años de Experiencia" },
    { num: "4", label: "Especies Procesadas" },
    { num: "4", label: "Certificaciones Activas" },
    { num: "100%", label: "Estándares Internacionales" },
  ];

  return (
    <Reveal>
      <div
        className="bg-soma-red flex items-center justify-center"
        style={{ padding: "28px 80px" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 text-center relative"
            style={{ padding: "0 40px" }}
          >
            {i < stats.length - 1 && (
              <span className="absolute right-0 top-[20%] bottom-[20%] w-[1px] bg-white/30" />
            )}
            <div className="font-display text-[48px] font-bold text-white leading-none">
              {s.num}
            </div>
            <div className="font-label text-[11px] font-medium tracking-[0.2em] uppercase text-white/75 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ─── ABOUT ─── */

function AboutSection() {
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

      {/* Visual card */}
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

/* ─── SERVICES ─── */

function ServicesSection() {
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

  return (
    <section
      id="servicios"
      className="bg-soma-black"
      style={{ padding: "100px 80px" }}
    >
      <Reveal><SectionEyebrow>Nuestros Servicios</SectionEyebrow></Reveal>
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

/* ─── CERTIFICATIONS ─── */

function CertificationsSection() {
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

  return (
    <section
      id="certificaciones"
      className="relative"
      style={{
        padding: "100px 80px",
        background: `
          radial-gradient(ellipse at 80% 20%, rgba(172,31,37,0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 10% 80%, rgba(0,0,0,0.4) 0%, transparent 50%),
          #3C2415
        `,
      }}
    >
      <Reveal><SectionEyebrow>Garantía de Calidad</SectionEyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-white mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Certificaciones que
          <br />
          Abren Mercados
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-soma-gray max-w-[540px] mb-[60px]">
          Nuestras certificaciones no son solo documentos — son el resultado de procesos
          auditados, personal capacitado y una cultura de inocuidad que atraviesa cada
          etapa de producción.
        </p>
      </Reveal>

      <div className="grid gap-6 mt-[60px]" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {certs.map((c, i) => (
          <Reveal key={c.title} delay={0.1 * i}>
            <div className="flex gap-6 p-10 bg-black/30 border border-white/10 rounded-sm hover:border-soma-red/60 transition-all duration-300">
              <div className="w-16 h-16 flex-shrink-0 rounded-full bg-soma-red/20 border-2 border-soma-red flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-soma-red" aria-hidden>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-[24px] font-semibold text-white mb-2">
                  {c.title}
                </h3>
                <p className="text-[14px] text-soma-gray-lt leading-[1.65]">{c.body}</p>
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

/* ─── MARKETS ─── */

function MarketsSection() {
  const markets = [
    {
      title: "Restaurantes y Hoteles",
      body: "Cortes gourmet a la medida. Atendemos las exigencias de la alta cocina con cortes premium, porciones exactas y consistencia de calidad en cada entrega.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
      ),
    },
    {
      title: "Supermercados y Tiendas",
      body: "Abasto constante con empaque al vacío, etiquetado NOM y presentaciones estandarizadas para anaquel. Cadena de frío documentada desde planta hasta punto de venta.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.46 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      title: "Exportación Internacional",
      body: "Habilitados con HACCP para exportación. Documentación sanitaria, certificados de origen y cumplimiento de requisitos de importación para mercados internacionales.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
          <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
        </svg>
      ),
    },
    {
      title: "Comunidad Kosher",
      body: "Planta certificada para proceso Kosher bajo supervisión rabínica. Cumplimos con todos los requisitos de la ley judía para el procesamiento de carne.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-soma-red" aria-hidden>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="productos"
      className="bg-soma-off-wh text-soma-black"
      style={{ padding: "100px 80px" }}
    >
      <Reveal><SectionEyebrow>A Quién Servimos</SectionEyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-soma-black mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Cuatro Mercados,
          <br />
          Un Solo Estándar
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[16px] font-light leading-[1.75] text-[#555] max-w-[540px] mb-[60px]">
          Nuestra capacidad instalada y certificaciones nos permiten atender a una amplia
          variedad de clientes — desde chefs de alta cocina hasta importadores internacionales.
        </p>
      </Reveal>

      <div className="grid gap-6 mt-[60px]" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {markets.map((m, i) => (
          <Reveal key={m.title} delay={0.1 * i}>
            <div className="border-t-[3px] border-soma-red p-8 px-6 bg-white shadow-sm hover:shadow-[0_8px_32px_rgba(172,31,37,0.12)] hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="w-11 h-11 bg-soma-red/10 rounded-sm flex items-center justify-center mb-5">
                {m.icon}
              </div>
              <h3 className="font-label text-[16px] font-bold tracking-[0.05em] uppercase text-soma-brown mb-2.5">
                {m.title}
              </h3>
              <p className="text-[14px] text-[#666] leading-[1.65]">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── SPECIES ─── */

function SpeciesSection() {
  const species = [
    { emoji: "🐂", label: "Bovino", name: "Res", desc: "Cortes premium, canales y maquila para todos los mercados.", bg: "#3C2415" },
    { emoji: "🐖", label: "Porcino", name: "Cerdo", desc: "Procesamiento completo bajo estándares TIF.", bg: "#2a1a10" },
    { emoji: "🐑", label: "Ovino", name: "Cordero", desc: "Especialistas en cordero para mercado Kosher y Halal.", bg: "#1e1408" },
    { emoji: "🐓", label: "Ave", name: "Pollo", desc: "Línea avícola con los mismos estándares de inocuidad.", bg: "#140e05" },
  ];

  return (
    <section
      className="bg-[#111008]"
      style={{ padding: "100px 80px 0" }}
    >
      <Reveal><SectionEyebrow>Especies que Procesamos</SectionEyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2
          className="font-display font-semibold leading-[1.1] text-white mb-5"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Capacidad Integral
          <br />
          en Cuatro Especies
        </h2>
      </Reveal>

      <div className="grid gap-0.5 mt-[60px]" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {species.map((s, i) => (
          <Reveal key={s.name} delay={0.1 * i}>
            <div
              className="relative overflow-hidden flex flex-col justify-end p-8 px-6"
              style={{ background: s.bg, aspectRatio: "3/4" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)",
                }}
              />
              <div className="absolute top-0 left-0 right-0 bottom-[60%] flex items-center justify-center text-[72px]">
                {s.emoji}
              </div>
              <div className="relative z-[1]">
                <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-red mb-1">
                  {s.label}
                </div>
                <div className="font-display text-[28px] font-semibold text-white leading-[1.1]">
                  {s.name}
                </div>
                <div className="text-[13px] text-soma-gray mt-2 leading-[1.5]">
                  {s.desc}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ─── */

function CTASection() {
  return (
    <Reveal>
      <div
        className="bg-soma-red relative overflow-hidden flex items-center justify-between gap-16 flex-col md:flex-row"
        style={{ padding: "80px" }}
      >
        <div
          className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-black/10 pointer-events-none"
        />
        <div className="relative z-[1] max-w-xl">
          <h2
            className="font-display font-semibold text-white leading-[1.1] mb-4"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            ¿Listo Para Trabajar con Nosotros?
          </h2>
          <p className="text-[16px] font-light text-white/85 leading-[1.65]">
            Contáctenos para recibir una cotización personalizada. Atendemos a empresas
            de todos los tamaños — desde restaurantes independientes hasta importadores
            internacionales.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap relative z-[1] flex-shrink-0">
          <a
            href="mailto:contacto@somameat.com"
            className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-soma-red bg-white border-2 border-white px-9 py-4 rounded-sm hover:bg-transparent hover:text-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Enviar Correo
          </a>
          <a
            href="https://wa.me/525614126327"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 font-label text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-[#25D366] border-2 border-[#25D366] px-9 py-4 rounded-sm hover:bg-transparent hover:text-[#25D366] transition-all duration-200 no-underline whitespace-nowrap"
          >
            <WhatsAppIcon />
            WhatsApp Directo
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── PAGE ─── */

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsBand />
      <AboutSection />
      <ServicesSection />
      <CertificationsSection />
      <MarketsSection />
      <SpeciesSection />
      <CTASection />
    </main>
  );
}
