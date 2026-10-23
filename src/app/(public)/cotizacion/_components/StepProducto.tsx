import { SelectCard } from "@/components/ui/SelectCard";
import { especies, certificaciones } from "../_data";

interface StepProductoProps {
  especie: string;
  setEspecie: (v: string) => void;
  certs: string[];
  toggleCert: (c: string) => void;
}

export function StepProducto({ especie, setEspecie, certs, toggleCert }: StepProductoProps) {
  return (
    <div>
      <h2 className="font-display text-[22px] sm:text-[26px] text-soma-black mb-1.5">¿Qué producto necesita?</h2>
      <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">
        Seleccione la especie y las certificaciones requeridas.
      </p>

      <div className="font-label text-[11px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">
        Especie
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {especies.map((e) => (
          <SelectCard key={e.name} selected={especie === e.name} onClick={() => setEspecie(e.name)}>
            <div className="text-[26px] sm:text-[28px] mb-2">{e.icon}</div>
            <div className="font-label text-[12px] sm:text-[13px] font-bold tracking-[0.05em] uppercase text-soma-black mb-1">
              {e.name}
            </div>
            <div className="text-[11px] sm:text-[12px] text-soma-gray leading-snug">{e.desc}</div>
          </SelectCard>
        ))}
      </div>

      <div className="font-label text-[11px] font-semibold tracking-[0.2em] uppercase text-soma-gray mb-3">
        Certificaciones
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {certificaciones.map((c) => (
          <SelectCard key={c.name} selected={certs.includes(c.name)} onClick={() => toggleCert(c.name)}>
            <div className="font-bold text-[13px] sm:text-[14px] text-soma-black text-center mb-1.5">{c.name}</div>
            <div className="text-center">
              <span
                className="inline-block font-label text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm"
                style={{
                  background: c.color + "18",
                  color: c.color,
                  border: `1px solid ${c.color}55`,
                }}
              >
                {c.sub}
              </span>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}
