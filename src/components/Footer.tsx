import Image from "next/image";

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-soma-red flex-shrink-0 mt-0.5" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-soma-red flex-shrink-0 mt-0.5" aria-hidden>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-soma-red flex-shrink-0 mt-0.5" aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-soma-red flex-shrink-0 mt-0.5" aria-hidden>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#070504] border-t-[3px] border-soma-red" style={{ padding: "64px 80px 32px" }}>
      <div
        className="grid gap-[60px] mb-[60px]"
        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
      >
        {/* Brand */}
        <div>
          <Image
            src="https://i0.wp.com/somameat.com/wp-content/uploads/2024/08/cropped-cropped-soma-logo-2-1.png?fit=300%2C123&ssl=1"
            alt="SOMA MEAT CO"
            width={148}
            height={60}
            className="h-[50px] w-auto object-contain mb-5"
            unoptimized
          />
          <p className="text-[14px] text-[#666] leading-[1.75] max-w-[260px]">
            Industria cárnica certificada con 20 años de experiencia. Procesamiento, corte, maquila y empaque bajo estándares TIF, HACCP, Kosher y Halal.
          </p>
        </div>

        {/* Servicios */}
        <div>
          <h4 className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5 pb-3 border-b border-[#222]">
            Servicios
          </h4>
          <ul className="flex flex-col gap-2.5 list-none">
            {["Rastro TIF", "Deshuese y Corte", "Maquila de Carne", "Empaque y Etiquetado"].map((item) => (
              <li key={item}>
                <a href="#servicios" className="text-[14px] text-[#666] hover:text-soma-red transition-colors duration-200 no-underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <h4 className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5 pb-3 border-b border-[#222]">
            Empresa
          </h4>
          <ul className="flex flex-col gap-2.5 list-none">
            {[
              { href: "#nosotros", label: "Nosotros" },
              { href: "#certificaciones", label: "Certificaciones" },
              { href: "#productos", label: "Mercados" },
            ].map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-[14px] text-[#666] hover:text-soma-red transition-colors duration-200 no-underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5 pb-3 border-b border-[#222]">
            Contacto
          </h4>
          <ul className="flex flex-col gap-3 list-none">
            <li className="flex items-start gap-2.5 text-[14px] text-[#666] leading-snug">
              <MapPinIcon />
              Teoloyucan, Estado de México C.P. 54783
            </li>
            <li className="flex items-start gap-2.5 text-[14px] text-[#666] leading-snug">
              <MailIcon />
              contacto@somameat.com
            </li>
            <li className="flex items-start gap-2.5 text-[14px] text-[#666] leading-snug">
              <PhoneIcon />
              56 1412 6327
            </li>
            <li className="flex items-start gap-2.5 text-[14px] text-[#666] leading-snug">
              <ClockIcon />
              Lun – Vie 9:00 AM – 5:00 PM
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-[#1a1a1a] flex-col md:flex-row gap-4">
        <p className="text-[13px] text-[#444]">
          © 2025 SOMA MEAT CO —{" "}
          <a href="mailto:contacto@somameat.com" className="text-soma-red no-underline hover:underline">
            Todos los derechos reservados
          </a>
        </p>
        <div className="flex gap-4 items-center">
          {["TIF", "HACCP", "Kosher", "Halal"].map((cert) => (
            <span
              key={cert}
              className="font-label text-[10px] font-bold tracking-[0.15em] uppercase text-[#555] border border-[#333] px-2.5 py-1 rounded-sm"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
