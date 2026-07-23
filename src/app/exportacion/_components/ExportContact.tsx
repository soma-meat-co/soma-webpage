export function ExportContact() {
  return (
    <div className="bg-soma-red relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-16 px-4 py-14 sm:px-10 sm:py-16 md:px-20 md:py-20">
      <div className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-black/10 pointer-events-none" />
      <div className="relative z-[1]">
        <h2 className="font-display font-semibold text-white leading-[1.1] mb-3 sm:mb-4" style={{ fontSize: "clamp(24px, 3.5vw, 46px)" }}>
          Ready to Source From Mexico?
        </h2>
        <p className="text-[14px] sm:text-[16px] font-light text-white/85 leading-[1.6] sm:leading-[1.65] max-w-[480px]">
          Contact our export team for pricing, documentation, and logistics information.
          We respond within 24 business hours.
        </p>
      </div>
      <div className="flex gap-3 sm:gap-4 flex-wrap relative z-[1] flex-shrink-0">
        <a
          href="mailto:contacto@somameat.com"
          className="font-label text-[12px] sm:text-[13px] font-bold tracking-[0.12em] uppercase text-soma-red bg-white border-2 border-white px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:bg-transparent hover:text-white transition-all duration-200 no-underline whitespace-nowrap"
        >
          Email Export Team
        </a>
        <a
          href="https://wa.me/525614126327"
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[12px] sm:text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/40 px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:border-white transition-all duration-200 no-underline whitespace-nowrap"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
