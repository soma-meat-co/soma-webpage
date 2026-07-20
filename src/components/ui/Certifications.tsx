"use client";

import { motion } from "framer-motion";

function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-white`} aria-hidden>
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

export function Certifications() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="hidden lg:grid grid-cols-2 gap-2 w-[190px] shrink-0"
    >
      {badges.map((b) => (
        <div
          key={b.title}
          className="aspect-square w-full flex flex-col items-center justify-center text-center gap-1 p-2.5 rounded-sm border border-soma-red/25 backdrop-blur-sm bg-white shadow-sm hover:border-soma-red hover:bg-soma-red/[0.04] transition-all duration-200"
        >
          <div className="w-[28%] aspect-square rounded-full bg-soma-red flex items-center justify-center flex-shrink-0">
            <ShieldIcon className="w-1/2 h-1/2" />
          </div>
          <div className="font-label">
            <strong className="block text-[10px] font-bold tracking-[0.02em] text-soma-black leading-tight">
              {b.title}
            </strong>
            <span className="block text-[7px] font-normal text-gray-500 tracking-[0.04em] uppercase mt-0.5">
              {b.sub}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
