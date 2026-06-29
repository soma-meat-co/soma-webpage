"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.856L.057 23.882l6.19-1.625A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-4.99-1.37l-.357-.212-3.677.964.981-3.585-.233-.368A9.79 9.79 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18c5.42 0 9.82 4.4 9.82 9.82 0 5.42-4.4 9.818-9.82 9.818z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

const navLinks = [
  { href: "/servicios", label: "Servicios" },
  { href: "#certificaciones", label: "Certificaciones" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/exportacion", label: "Export" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-[100] flex items-center justify-between bg-white border-b-[3px] border-soma-red transition-all duration-300"
        style={{
          padding: "0 48px",
          height: scrolled ? "60px" : "72px",
          boxShadow: scrolled
            ? "0 4px 32px rgba(0,0,0,0.25)"
            : "0 2px 24px rgba(0,0,0,0.15)",
        }}
      >
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://i0.wp.com/somameat.com/wp-content/uploads/2024/08/cropped-cropped-soma-logo-2-1.png?fit=300%2C123&ssl=1"
            alt="SOMA MEAT CO"
            width={148}
            height={60}
            className="object-contain transition-all duration-300"
            style={{ height: scrolled ? "36px" : "44px", width: "auto" }}
            priority
            unoptimized
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-9 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-soma-brown hover:text-soma-red transition-colors duration-200 no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/cotizacion"
              className="flex items-center gap-2 bg-soma-red text-white font-label text-[13px] font-bold tracking-[0.12em] uppercase px-[22px] py-[9px] rounded-sm hover:bg-soma-red-dk transition-colors duration-200 no-underline"
            >
              Cotizar
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/525614126327"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-soma-brown/40 text-soma-brown font-label text-[13px] font-bold tracking-[0.12em] uppercase px-[22px] py-[9px] rounded-sm hover:border-soma-red hover:text-soma-red transition-colors duration-200 no-underline"
            >
              <WhatsAppIcon />
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-soma-brown p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 w-72 h-full bg-white border-l border-gray-100 shadow-2xl flex flex-col pt-20 pb-8 px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-6 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-label text-[14px] font-semibold tracking-[0.12em] uppercase text-soma-brown hover:text-soma-red transition-colors duration-200 no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <a
                  href="/cotizacion"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-soma-red text-white font-label text-[13px] font-bold tracking-[0.12em] uppercase px-6 py-3 rounded-sm hover:bg-soma-red-dk transition-colors duration-200 no-underline"
                >
                  Cotizar Ahora
                </a>
                <a
                  href="https://wa.me/525614126327"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-soma-brown/40 text-soma-brown font-label text-[13px] font-bold tracking-[0.12em] uppercase px-6 py-3 rounded-sm hover:border-soma-red hover:text-soma-red transition-colors duration-200 no-underline"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
