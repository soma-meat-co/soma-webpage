"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const RED = "#AC1F25";
const BROWN = "#3C2415";

const steps = ["Producto", "Cortes", "Volumen", "Contacto"];

const especies = [
  { icon: "🐑", name: "Cordero / Ovino", desc: "Canal entera y todos los cortes de cordero" },
  { icon: "🐂", name: "Res / Bovino", desc: "Cortes premium de res bajo TIF 422" },
  { icon: "🐖", name: "Cerdo / Porcino", desc: "Procesamiento completo porcino TIF" },
  { icon: "🐓", name: "Ave / Pollo", desc: "Línea avícola con estándares TIF" },
];

const cortesData = [
  {
    cat: "Canal",
    items: [
      { e: "🐑", n: "Canal Entera", w: "8–16 kg" },
      { e: "🐑", n: "Media Canal", w: "4–8 kg" },
    ],
  },
  {
    cat: "Pierna y Paleta",
    items: [
      { e: "🍖", n: "Pierna", w: "1.5–3 kg" },
      { e: "🍖", n: "Paleta C/Hueso", w: "1–2 kg" },
      { e: "🥩", n: "Paleta S/Hueso", w: "700g–1.5 kg" },
    ],
  },
  {
    cat: "Costillar",
    items: [
      { e: "🥩", n: "Rack / Frenched", w: "600g–1.2 kg" },
      { e: "🥩", n: "Costillar", w: "700g–1.5 kg" },
    ],
  },
  {
    cat: "Lomo y Más",
    items: [
      { e: "🥩", n: "Lomo", w: "400–800g" },
      { e: "🍖", n: "Chamorro", w: "300–600g" },
      { e: "🦴", n: "Cuello", w: "400–700g" },
      { e: "✏️", n: "A Especificación", w: "Personalizado" },
    ],
  },
];

const freqs = ["Pedido único", "Semanal", "Quincenal", "Mensual"];
const empaques = ["Al Vacío", "A Granel", "Sin preferencia"];
const tiposCliente = [
  "Restaurante / Hotel",
  "Supermercado / Tienda",
  "Distribuidor / Mayorista",
  "Exportador / Importador",
  "Carnicería",
  "Catering",
  "Consumidor final",
];

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className="relative border-2 rounded-sm p-4 cursor-pointer transition-all duration-200"
      style={{
        borderColor: selected ? RED : "rgba(255,255,255,0.12)",
        background: selected ? "rgba(172,31,37,0.1)" : "transparent",
      }}
    >
      {selected && (
        <span className="absolute top-2 right-3 font-bold text-[14px]" style={{ color: RED }}>
          ✓
        </span>
      )}
      {children}
    </div>
  );
}

export default function CotizacionPage() {
  const [step, setStep] = useState(0);
  const [especie, setEspecie] = useState("");
  const [certs, setCerts] = useState(["TIF 422"]);
  const [cortes, setCortes] = useState<string[]>([]);
  const [volumen, setVolumen] = useState(100);
  const [freq, setFreq] = useState("");
  const [empaque, setEmpaque] = useState("");
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [tel, setTel] = useState("");
  const [tipo, setTipo] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const toggleCert = (c: string) => {
    if (c === "TIF 422") return;
    setCerts((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleCorte = (c: string) => {
    setCortes((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const next = () => {
    if (step === 0 && !especie) { setError("Seleccione una especie"); return; }
    if (step === 1 && cortes.length === 0) { setError("Seleccione al menos un corte"); return; }
    if (step === 2 && (!freq || !empaque)) { setError("Complete frecuencia y empaque"); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const send = () => {
    if (!nombre || !tel) { setError("Nombre y teléfono son requeridos"); return; }
    const msg = `🥩 COTIZACIÓN SOMA MEAT CO — TIF 422\n\n👤 ${nombre}${empresa ? " — " + empresa : ""}\n📞 ${tel}\n${tipo ? "🏢 " + tipo + "\n" : ""}\n📋 Pedido:\n• Especie: ${especie}\n• Cert: ${certs.join(", ")}\n• Cortes: ${cortes.join(", ")}\n• Volumen: ${volumen} kg\n• Frecuencia: ${freq}\n• Empaque: ${empaque}`;
    const wa = `https://wa.me/525614126327?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
    setDone(true);
  };

  const progress = (step / 4) * 100;

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-soma-black">
        <div
          className="rounded-sm p-12 text-center max-w-[480px] border-2"
          style={{ background: "rgba(172,31,37,.1)", borderColor: RED }}
        >
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display text-[32px] text-white mb-3">¡Cotización Enviada!</h2>
          <p className="text-soma-gray-lt leading-[1.7] mb-7">
            Su solicitud fue enviada a nuestro equipo vía WhatsApp. Le respondemos en menos de{" "}
            <strong className="text-white">24 horas hábiles</strong>.
          </p>
          <button
            onClick={() => {
              setDone(false); setStep(0); setEspecie(""); setCerts(["TIF 422"]);
              setCortes([]); setFreq(""); setEmpaque(""); setNombre(""); setTel("");
            }}
            className="font-label text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3 border rounded-sm transition-colors duration-200"
            style={{ color: RED, borderColor: RED, background: "transparent" }}
          >
            Nueva Cotización
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soma-black text-soma-off-wh">
      {/* Page Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 80% 30%, rgba(172,31,37,.3) 0%, transparent 60%), ${BROWN}`, padding: "120px 80px 64px" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[5px]" style={{ background: "linear-gradient(180deg,transparent,#AC1F25 20%,#AC1F25 80%,transparent)" }} />
        <div className="absolute right-[-40px] top-[-40px] font-display font-bold leading-none pointer-events-none select-none" style={{ fontSize: "220px", color: "rgba(172,31,37,0.07)" }}>$</div>
        <div className="relative z-[1] max-w-[680px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-7 h-[1px] bg-soma-red" />
            <span className="font-label text-[11px] font-semibold tracking-[0.25em] uppercase text-soma-red">
              TIF 422 — Planta Certificada
            </span>
          </div>
          <h1 className="font-display font-semibold text-white leading-none mb-4" style={{ fontSize: "clamp(36px,5vw,66px)" }}>
            Cotiza tu <em className="text-soma-red not-italic">Pedido</em>
          </h1>
          <p className="text-[15px] font-light leading-[1.75] text-soma-gray-lt">
            4 pasos · Cotización personalizada · Respuesta en 24 horas
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-black/30 border-b border-white/[0.08]" style={{ padding: "13px 80px" }}>
        <div className="flex items-center gap-2.5 font-label text-[11px] tracking-[0.12em] uppercase">
          <a href="/" className="text-soma-gray hover:text-soma-red transition-colors">Inicio</a>
          <span className="text-white/25">›</span>
          <span className="text-white font-semibold">Cotización</span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-[700px] mx-auto px-5 py-10">
        {/* Step tabs */}
        <div className="flex rounded-sm overflow-hidden border border-white/[0.08] bg-white/[0.03] mb-6">
          {steps.map((s, i) => (
            <div
              key={i}
              onClick={() => i < step && setStep(i)}
              className="flex-1 py-3 px-2 text-center transition-colors duration-200 border-r border-white/[0.08] last:border-r-0"
              style={{
                background: i === step ? RED : i < step ? "rgba(172,31,37,0.2)" : "transparent",
                cursor: i < step ? "pointer" : "default",
              }}
            >
              <div className="font-display text-[18px] font-bold text-white leading-none">
                {i < step ? "✓" : i + 1}
              </div>
              <div className="font-label text-[10px] font-semibold tracking-[0.12em] uppercase mt-1" style={{ color: i === step ? "white" : "rgba(255,255,255,0.6)" }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-white/10 rounded-sm mb-7 overflow-hidden">
          <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${progress}%`, background: RED }} />
        </div>

        {/* STEP 1 — Producto */}
        {step === 0 && (
          <div>
            <h2 className="font-display text-[26px] text-white mb-1.5">¿Qué producto necesita?</h2>
            <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">Seleccione la especie y las certificaciones requeridas.</p>

            <div className="font-label text-[11px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">Especie</div>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {especies.map((e) => (
                <SelectCard key={e.name} selected={especie === e.name} onClick={() => setEspecie(e.name)}>
                  <div className="text-[28px] mb-2">{e.icon}</div>
                  <div className="font-label text-[13px] font-bold tracking-[0.05em] uppercase text-white mb-1">{e.name}</div>
                  <div className="text-[12px] text-soma-gray leading-snug">{e.desc}</div>
                </SelectCard>
              ))}
            </div>

            <div className="font-label text-[11px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">Certificaciones</div>
            <div className="grid grid-cols-3 gap-2.5">
              {([["TIF 422", "Siempre incluido", RED], ["Kosher", "Bajo solicitud", BROWN], ["Halal", "Bajo solicitud", "#006644"]] as [string, string, string][]).map(([c, sub, col]) => (
                <SelectCard key={c} selected={certs.includes(c)} onClick={() => toggleCert(c)}>
                  <div className="font-bold text-[14px] text-white text-center mb-1.5">{c}</div>
                  <div className="text-center">
                    <span className="inline-block font-label text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm" style={{ background: col + "44", color: c === "Halal" ? "#7de8b8" : c === "Kosher" ? "#D4D5D7" : "#e88", border: `1px solid ${col}88` }}>
                      {sub}
                    </span>
                  </div>
                </SelectCard>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Cortes */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[26px] text-white mb-1.5">¿Qué cortes necesita?</h2>
            <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">Seleccione uno o varios cortes. Puede seleccionar múltiples.</p>
            {cortesData.map((cat) => (
              <div key={cat.cat} className="mb-5">
                <div className="flex items-center gap-2.5 font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-2.5">
                  <div className="flex-1 h-[1px] bg-white/10" />
                  {cat.cat}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {cat.items.map((it) => (
                    <SelectCard key={it.n} selected={cortes.includes(it.n)} onClick={() => toggleCorte(it.n)}>
                      <div className="text-[22px] mb-1.5 text-center">{it.e}</div>
                      <div className="font-label text-[11px] font-bold tracking-[0.05em] uppercase text-white text-center mb-1">{it.n}</div>
                      <div className="text-[10px] text-soma-gray text-center">{it.w}</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
            ))}
            {cortes.length > 0 && (
              <div className="mt-2 px-4 py-3 rounded-sm border-l-[3px]" style={{ background: "rgba(172,31,37,0.08)", borderColor: RED }}>
                <div className="text-[12px] text-soma-gray-lt">✓ Seleccionados: <strong className="text-white">{cortes.join(" · ")}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Volumen */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[26px] text-white mb-1.5">¿Qué volumen necesita?</h2>
            <p className="text-[13px] text-soma-gray mb-7 leading-relaxed">Indique el volumen estimado y la frecuencia de compra.</p>

            <div className="text-center mb-5">
              <div className="font-display font-bold leading-none" style={{ fontSize: 64, color: RED }}>{volumen.toLocaleString("es-MX")}</div>
              <div className="font-label text-[12px] font-semibold tracking-[0.2em] uppercase text-soma-gray mt-1">kilogramos por pedido</div>
            </div>
            <input
              type="range" min={10} max={5000} step={10} value={volumen}
              onChange={(e) => setVolumen(parseInt(e.target.value))}
              className="w-full cursor-pointer mb-1.5"
              style={{ accentColor: RED }}
            />
            <div className="flex justify-between font-label text-[10px] text-soma-gray tracking-[0.1em] mb-7">
              <span>10 kg</span><span>500 kg</span><span>1,000 kg</span><span>5,000 kg</span>
            </div>

            <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">Frecuencia de Compra</div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {freqs.map((f) => (
                <SelectCard key={f} selected={freq === f} onClick={() => setFreq(f)}>
                  <div className="font-label text-[12px] font-bold uppercase tracking-[0.05em] text-white text-center">{f}</div>
                </SelectCard>
              ))}
            </div>

            <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">Empaque Preferido</div>
            <div className="grid grid-cols-3 gap-2">
              {empaques.map((em) => (
                <SelectCard key={em} selected={empaque === em} onClick={() => setEmpaque(em)}>
                  <div className="font-label text-[12px] font-bold uppercase tracking-[0.05em] text-white text-center">{em}</div>
                </SelectCard>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Contacto */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-[26px] text-white mb-1.5">Sus Datos de Contacto</h2>
            <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">Solo necesitamos estos datos para enviarle la cotización.</p>

            {/* Resumen */}
            <div className="rounded-sm p-5 mb-6 border" style={{ background: "rgba(172,31,37,0.08)", borderColor: "rgba(172,31,37,0.3)" }}>
              <div className="font-label text-[11px] font-bold tracking-[0.2em] uppercase mb-3.5 pb-2.5 border-b border-white/[0.08]" style={{ color: RED }}>
                Resumen de su Pedido
              </div>
              {[
                ["Especie", especie],
                ["Certificaciones", certs.join(", ")],
                ["Cortes", cortes.join(", ")],
                ["Volumen", `${volumen.toLocaleString("es-MX")} kg`],
                ["Frecuencia", freq],
                ["Empaque", empaque],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between mb-2 text-[13px]">
                  <span className="font-label text-[11px] uppercase tracking-[0.08em] text-soma-gray">{l}</span>
                  <span className="text-white font-semibold text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3.5">
              {([
                ["Nombre *", nombre, setNombre, "Su nombre completo", "text"],
                ["Empresa", empresa, setEmpresa, "Nombre de su empresa", "text"],
                ["Teléfono / WhatsApp *", tel, setTel, "+52 55 0000 0000", "tel"],
              ] as [string, string, (v: string) => void, string, string][]).map(([label, val, setter, ph, type]) => (
                <div key={label}>
                  <div className="font-label text-[10px] font-semibold tracking-[0.12em] uppercase text-soma-gray mb-1.5">{label}</div>
                  <Input
                    type={type}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={ph}
                    className="bg-white/[0.06] border-white/15 text-white placeholder:text-soma-gray/60 font-body"
                  />
                </div>
              ))}
              <div>
                <div className="font-label text-[10px] font-semibold tracking-[0.12em] uppercase text-soma-gray mb-1.5">Tipo de Cliente</div>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-sm px-3.5 py-3 text-[14px] text-white outline-none"
                  style={{ background: BROWN, border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <option value="">Seleccionar...</option>
                  {tiposCliente.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 px-3 py-2 rounded-sm font-label text-[12px] font-semibold tracking-[0.08em]" style={{ color: RED, background: "rgba(172,31,37,0.1)" }}>
            ⚠ {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-7 gap-3">
          {step > 0 ? (
            <button
              onClick={() => { setStep((s) => s - 1); setError(""); }}
              className="font-label text-[12px] font-semibold tracking-[0.12em] uppercase px-6 py-3.5 border rounded-sm transition-colors hover:border-white/40"
              style={{ color: "#A7A9AC", borderColor: "rgba(255,255,255,0.2)", background: "transparent" }}
            >
              ← Anterior
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={next}
              className="font-label text-[12px] font-bold tracking-[0.12em] uppercase px-8 py-3.5 rounded-sm text-white transition-opacity hover:opacity-90"
              style={{ background: RED }}
            >
              Siguiente: {steps[step + 1]} →
            </button>
          ) : (
            <button
              onClick={send}
              className="flex items-center gap-2 font-label text-[12px] font-bold tracking-[0.12em] uppercase px-7 py-3.5 rounded-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              📲 Enviar por WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
