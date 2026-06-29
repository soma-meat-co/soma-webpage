import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Export Division — SOMA MEAT CO | TIF 422 Certified Premium Lamb | Mexico",
  description: "SOMA MEAT CO — Mexico's TIF 422 certified meat processing plant. Premium lamb cuts for international markets. HACCP certified, Kosher & Halal available.",
};

const exportMarkets = [
  { flag: "🇺🇸", country: "United States", sub: "Premium retail & food service" },
  { flag: "🇨🇦", country: "Canada", sub: "Kosher & premium channels" },
  { flag: "🇯🇵", country: "Japan", sub: "High-end gastronomy" },
  { flag: "🇮🇱", country: "Israel", sub: "Kosher certified market" },
  { flag: "🇦🇪", country: "UAE", sub: "Halal premium segment" },
  { flag: "🇬🇧", country: "United Kingdom", sub: "Specialty retailers" },
];

const certifications = [
  {
    cert: "TIF 422",
    full: "Tipo Inspección Federal",
    body: "Mexico's highest federal meat quality standard. Permanent veterinary inspection, full animal traceability and mandatory SENASICA-SAGARPA compliance on every processed lot.",
  },
  {
    cert: "HACCP",
    full: "Hazard Analysis & Critical Control Points",
    body: "International food safety management system enabling export to global markets with the most demanding sanitary requirements, including the US, EU, and Japan.",
  },
  {
    cert: "Kosher",
    full: "Certified Rabbinical Supervision",
    body: "Full kosher process under certified rabbinical oversight. Authorized to supply the Jewish community and export to international markets requiring kosher certification.",
  },
  {
    cert: "Halal",
    full: "Islamic Law Compliant",
    body: "Processing under Islamic law principles and requirements. Certification opens access to predominantly Muslim countries and halal-certified communities worldwide.",
  },
];

const exportCuts = [
  { name: "Whole Carcass", weight: "8–16 kg", desc: "Full chilled or frozen carcass, TIF inspected." },
  { name: "Leg of Lamb", weight: "1.5–3 kg", desc: "Bone-in or boneless. Vacuum or MAP packed." },
  { name: "Rack / Frenched", weight: "600g–1.2 kg", desc: "Premium frenched rack. Individually packed." },
  { name: "Shoulder", weight: "1–2 kg", desc: "Bone-in or deboned, ready for retail or foodservice." },
  { name: "Loin", weight: "400–800g", desc: "Most tender cut. Portion-controlled for fine dining." },
  { name: "Custom Cuts", weight: "As spec", desc: "Any cut, weight, packaging or labeling to buyer specs." },
];

export default function ExportacionPage() {
  return (
    <main className="bg-soma-black text-soma-off-wh">
      {/* Hero */}
      <div
        className="min-h-screen flex items-center relative overflow-hidden"
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
          className="absolute left-0 top-0 bottom-0 w-[5px] z-[2]"
          style={{ background: "linear-gradient(180deg,transparent,#AC1F25 20%,#AC1F25 80%,transparent)" }}
        />

        <div className="relative z-[3] max-w-[760px]">
          <div className="flex items-center gap-3 mb-7">
            <span className="block w-10 h-[1px] bg-soma-red" />
            <span className="font-label text-[12px] font-semibold tracking-[0.25em] uppercase text-soma-red">
              Teoloyucan, Mexico · Export Division
            </span>
          </div>
          <h1
            className="font-display font-semibold leading-none text-white mb-6"
            style={{ fontSize: "clamp(44px, 6.5vw, 84px)" }}
          >
            Mexico&apos;s Premium{" "}
            <em className="text-soma-red not-italic">Lamb</em>{" "}
            for Global Markets
          </h1>
          <p className="text-[17px] font-light leading-[1.8] text-soma-gray-lt max-w-[560px] mb-12">
            TIF 422 certified processing plant with HACCP authorization for export. Premium lamb
            and meat cuts available with Kosher and Halal certification — ready for international
            buyers.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="mailto:export@somameat.com"
              className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-soma-red border-2 border-soma-red px-9 py-4 rounded-sm hover:bg-transparent hover:text-soma-red transition-all duration-200 no-underline"
            >
              Contact Export Team
            </a>
            <a
              href="/cotizacion"
              className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/25 px-9 py-4 rounded-sm hover:border-white transition-all duration-200 no-underline"
            >
              Get a Quote
            </a>
          </div>
        </div>

        {/* Language toggle */}
        <div className="absolute top-24 right-20 z-[3] flex gap-1">
          <a href="/" className="font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm border border-soma-brown/30 text-soma-brown hover:border-soma-red hover:text-soma-red transition-colors no-underline">ES</a>
          <a href="/exportacion" className="font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm bg-soma-red border border-soma-red text-white no-underline">EN</a>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-soma-red flex items-center justify-center" style={{ padding: "28px 80px" }}>
        {[
          { num: "20+", label: "Years in Operation" },
          { num: "TIF 422", label: "Federal Certification" },
          { num: "HACCP", label: "Export Authorization" },
          { num: "4", label: "Active Certifications" },
        ].map((s, i) => (
          <div key={s.label} className="flex-1 text-center relative" style={{ padding: "0 36px" }}>
            {i < 3 && <span className="absolute right-0 top-[20%] bottom-[20%] w-[1px] bg-white/30" />}
            <div className="font-display text-[40px] font-bold text-white leading-none">{s.num}</div>
            <div className="font-label text-[11px] font-medium tracking-[0.2em] uppercase text-white/75 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <section style={{ padding: "100px 80px", background: "#3C2415", backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(172,31,37,0.25) 0%, transparent 50%)" }}>
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-7 h-[2px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">Quality Assurance</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-semibold text-white leading-[1.1] mb-5" style={{ fontSize: "clamp(36px, 4vw, 56px)" }}>
            Certifications That Open Doors
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[16px] font-light leading-[1.75] text-soma-gray max-w-[540px] mb-[60px]">
            Our certifications are the result of audited processes, trained staff, and a culture
            of food safety throughout every stage of production.
          </p>
        </Reveal>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {certifications.map((c, i) => (
            <Reveal key={c.cert} delay={0.1 * i}>
              <div className="flex gap-6 p-10 bg-black/30 border border-white/10 rounded-sm hover:border-soma-red/60 transition-all duration-300">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-soma-red/20 border-2 border-soma-red flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-soma-red" aria-hidden>
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-[24px] font-semibold text-white mb-1">{c.cert}</h3>
                  <p className="font-label text-[10px] tracking-[0.12em] uppercase text-soma-red mb-3">{c.full}</p>
                  <p className="text-[14px] text-soma-gray-lt leading-[1.65]">{c.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Export cuts */}
      <section style={{ padding: "100px 80px" }}>
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-7 h-[2px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">Product Catalog</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-semibold text-white leading-[1.1] mb-5" style={{ fontSize: "clamp(36px, 4vw, 56px)" }}>
            Premium Cuts for Export
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[16px] font-light leading-[1.75] text-soma-gray max-w-[540px] mb-[60px]">
            All cuts are processed and packed at our TIF 422 facility. Vacuum or MAP packaging,
            custom labeling, and full export documentation available.
          </p>
        </Reveal>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {exportCuts.map((cut, i) => (
            <Reveal key={cut.name} delay={0.08 * i}>
              <div className="border border-white/[0.08] rounded-sm p-6 bg-white/[0.02] hover:border-soma-red/50 hover:bg-soma-red/[0.04] transition-all duration-300">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-display text-[20px] font-semibold text-white leading-tight">{cut.name}</h3>
                  <span className="font-label text-[10px] tracking-[0.08em] uppercase text-soma-red border border-soma-red/40 px-2 py-0.5 rounded-sm flex-shrink-0 mt-0.5 whitespace-nowrap">{cut.weight}</span>
                </div>
                <p className="text-[13px] text-soma-gray leading-relaxed">{cut.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Markets */}
      <section className="bg-soma-off-wh text-soma-black" style={{ padding: "100px 80px" }}>
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-7 h-[2px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">Global Reach</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-semibold text-soma-black leading-[1.1] mb-5" style={{ fontSize: "clamp(36px, 4vw, 56px)" }}>
            Markets We Serve
          </h2>
        </Reveal>
        <div className="grid gap-4 mt-[60px]" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {exportMarkets.map((m, i) => (
            <Reveal key={m.country} delay={0.08 * i}>
              <div className="flex items-center gap-4 p-5 bg-white border-t-[3px] border-soma-red shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="text-4xl">{m.flag}</span>
                <div>
                  <div className="font-label text-[15px] font-bold tracking-[0.05em] uppercase text-soma-brown">{m.country}</div>
                  <div className="text-[13px] text-[#666]">{m.sub}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <div className="bg-soma-red relative overflow-hidden flex items-center justify-between gap-16 flex-col md:flex-row" style={{ padding: "80px" }}>
        <div className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-black/10 pointer-events-none" />
        <div className="relative z-[1]">
          <h2 className="font-display font-semibold text-white leading-[1.1] mb-4" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            Ready to Source From Mexico?
          </h2>
          <p className="text-[16px] font-light text-white/85 leading-[1.65] max-w-[480px]">
            Contact our export team for pricing, documentation, and logistics information.
            We respond within 24 business hours.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap relative z-[1] flex-shrink-0">
          <a
            href="mailto:export@somameat.com"
            className="font-label text-[13px] font-bold tracking-[0.12em] uppercase text-soma-red bg-white border-2 border-white px-9 py-4 rounded-sm hover:bg-transparent hover:text-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            Email Export Team
          </a>
          <a
            href="https://wa.me/525614126327"
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/40 px-9 py-4 rounded-sm hover:border-white transition-all duration-200 no-underline whitespace-nowrap"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
