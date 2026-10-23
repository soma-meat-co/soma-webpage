import { SelectCard } from "@/components/ui/SelectCard";
import { cortesData } from "../_data";

interface StepCortesProps {
  cortes: string[];
  toggleCorte: (c: string) => void;
}

export function StepCortes({ cortes, toggleCorte }: StepCortesProps) {
  return (
    <div>
      <h2 className="font-display text-[22px] sm:text-[26px] text-soma-black mb-1.5">¿Qué cortes necesita?</h2>
      <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">
        Seleccione uno o varios cortes. Puede seleccionar múltiples.
      </p>
      {cortesData.map((cat) => (
        <div key={cat.cat} className="mb-5">
          <div className="flex items-center gap-2.5 font-label text-[10px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-2.5">
            <div className="flex-1 h-[1px] bg-soma-black/10" />
            {cat.cat}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cat.items.map((it) => (
              <SelectCard key={it.n} selected={cortes.includes(it.n)} onClick={() => toggleCorte(it.n)}>
                <div className="text-[20px] sm:text-[22px] mb-1.5 text-center">{it.e}</div>
                <div className="font-label text-[10px] sm:text-[11px] font-bold tracking-[0.05em] uppercase text-soma-black text-center mb-1">
                  {it.n}
                </div>
                <div className="text-[9px] sm:text-[10px] text-soma-gray text-center">{it.w}</div>
              </SelectCard>
            ))}
          </div>
        </div>
      ))}
      {cortes.length > 0 && (
        <div className="mt-2 px-4 py-3 rounded-sm border-l-[3px] border-soma-red bg-soma-red/[0.08]">
          <div className="text-[12px] text-[#555]">
            ✓ Seleccionados: <strong className="text-soma-black">{cortes.join(" · ")}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
