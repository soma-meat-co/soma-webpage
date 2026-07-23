import { SelectCard } from "@/components/ui/SelectCard";
import { freqs, empaques } from "../_data";

interface StepVolumenProps {
  volumen: number;
  setVolumen: (v: number) => void;
  freq: string;
  setFreq: (v: string) => void;
  empaque: string;
  setEmpaque: (v: string) => void;
}

export function StepVolumen({ volumen, setVolumen, freq, setFreq, empaque, setEmpaque }: StepVolumenProps) {
  return (
    <div>
      <h2 className="font-display text-[22px] sm:text-[26px] text-soma-black mb-1.5">¿Qué volumen necesita?</h2>
      <p className="text-[13px] text-soma-gray mb-6 sm:mb-7 leading-relaxed">
        Indique el volumen estimado y la frecuencia de compra.
      </p>

      <div className="text-center mb-5">
        <div className="font-display font-bold leading-none text-soma-red text-[48px] sm:text-[64px]">
          {volumen.toLocaleString("es-MX")}
        </div>
        <div className="font-label text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase text-soma-gray mt-1">
          kilogramos por pedido
        </div>
      </div>
      <input
        type="range"
        min={10}
        max={5000}
        step={10}
        value={volumen}
        onChange={(e) => setVolumen(parseInt(e.target.value))}
        className="w-full cursor-pointer mb-1.5 accent-soma-red"
      />
      <div className="flex justify-between font-label text-[9px] sm:text-[10px] text-soma-gray tracking-[0.1em] mb-6 sm:mb-7">
        <span>10 kg</span>
        <span>500 kg</span>
        <span>1,000 kg</span>
        <span>5,000 kg</span>
      </div>

      <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">
        Frecuencia de Compra
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {freqs.map((f) => (
          <SelectCard key={f} selected={freq === f} onClick={() => setFreq(f)}>
            <div className="font-label text-[12px] font-bold uppercase tracking-[0.05em] text-soma-black text-center">
              {f}
            </div>
          </SelectCard>
        ))}
      </div>

      <div className="font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">
        Empaque Preferido
      </div>
      <div className="grid grid-cols-3 gap-2">
        {empaques.map((em) => (
          <SelectCard key={em} selected={empaque === em} onClick={() => setEmpaque(em)}>
            <div className="font-label text-[12px] font-bold uppercase tracking-[0.05em] text-soma-black text-center">
              {em}
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}
