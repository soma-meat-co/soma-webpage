"use client";

import { useState } from "react";
import { StepTabs } from "@/components/ui/StepTabs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuoteHero } from "./_components/QuoteHero";
import { ConfirmationScreen } from "./_components/ConfirmationScreen";
import { StepProducto } from "./_components/StepProducto";
import { StepCortes } from "./_components/StepCortes";
import { StepVolumen } from "./_components/StepVolumen";
import { StepContacto } from "./_components/StepContacto";
import { steps } from "./_data";

export default function CotizacionPage() {
  const [step, setStep] = useState(0);
  const [especie, setEspecie] = useState("");
  const [certs, setCerts] = useState(["TIF 845"]);
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
    if (c === "TIF 845") return;
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

  const reset = () => {
    setDone(false);
    setStep(0);
    setEspecie("");
    setCerts(["TIF 422"]);
    setCortes([]);
    setFreq("");
    setEmpaque("");
    setNombre("");
    setTel("");
  };

  const progress = (step / 4) * 100;

  if (done) {
    return <ConfirmationScreen onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-soma-off-wh text-soma-black">
      <QuoteHero />
      <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14">
        <div className="max-w-[700px] md:max-w-[820px] mx-auto bg-white rounded-sm border border-soma-black/10 border-t-4 border-t-soma-red shadow-sm md:shadow-md p-5 sm:p-7 md:p-10">
        <StepTabs steps={steps} current={step} onStepClick={setStep} />
        <ProgressBar progress={progress} />

        {step === 0 && (
          <StepProducto especie={especie} setEspecie={setEspecie} certs={certs} toggleCert={toggleCert} />
        )}
        {step === 1 && <StepCortes cortes={cortes} toggleCorte={toggleCorte} />}
        {step === 2 && (
          <StepVolumen
            volumen={volumen}
            setVolumen={setVolumen}
            freq={freq}
            setFreq={setFreq}
            empaque={empaque}
            setEmpaque={setEmpaque}
          />
        )}
        {step === 3 && (
          <StepContacto
            especie={especie}
            certs={certs}
            cortes={cortes}
            volumen={volumen}
            freq={freq}
            empaque={empaque}
            nombre={nombre}
            setNombre={setNombre}
            empresa={empresa}
            setEmpresa={setEmpresa}
            tel={tel}
            setTel={setTel}
            tipo={tipo}
            setTipo={setTipo}
          />
        )}

        {error && (
          <div className="mt-3 px-3 py-2 rounded-sm font-label text-[12px] font-semibold tracking-[0.08em] text-soma-red bg-soma-red/10">
            ⚠ {error}
          </div>
        )}

        <div className="flex justify-between mt-7 gap-3">
          {step > 0 ? (
            <button
              onClick={() => { setStep((s) => s - 1); setError(""); }}
              className="font-label text-[12px] font-semibold tracking-[0.12em] uppercase px-5 py-3 sm:px-6 sm:py-3.5 border rounded-sm transition-colors hover:border-soma-black/40 text-soma-gray border-soma-black/15"
            >
              ← Anterior
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={next}
              className="font-label text-[12px] font-bold tracking-[0.12em] uppercase px-6 py-3 sm:px-8 sm:py-3.5 rounded-sm text-white bg-soma-red transition-opacity hover:opacity-90"
            >
              Siguiente: {steps[step + 1]} →
            </button>
          ) : (
            <button
              onClick={send}
              className="flex items-center gap-2 font-label text-[12px] font-bold tracking-[0.12em] uppercase px-5 py-3 sm:px-7 sm:py-3.5 rounded-sm text-white bg-[#25D366] transition-opacity hover:opacity-90"
            >
              📲 Enviar por WhatsApp
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
