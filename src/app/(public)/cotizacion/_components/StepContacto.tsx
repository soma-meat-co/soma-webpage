import { FormField } from "@/components/ui/FormField";
import { tiposCliente } from "../_data";

interface StepContactoProps {
  especie: string;
  certs: string[];
  cortes: string[];
  volumen: number;
  freq: string;
  empaque: string;
  nombre: string;
  setNombre: (v: string) => void;
  empresa: string;
  setEmpresa: (v: string) => void;
  tel: string;
  setTel: (v: string) => void;
  tipo: string;
  setTipo: (v: string) => void;
}

export function StepContacto({
  especie,
  certs,
  cortes,
  volumen,
  freq,
  empaque,
  nombre,
  setNombre,
  empresa,
  setEmpresa,
  tel,
  setTel,
  tipo,
  setTipo,
}: StepContactoProps) {
  const resumen: [string, string][] = [
    ["Especie", especie],
    ["Certificaciones", certs.join(", ")],
    ["Cortes", cortes.join(", ")],
    ["Volumen", `${volumen.toLocaleString("es-MX")} kg`],
    ["Frecuencia", freq],
    ["Empaque", empaque],
  ];

  return (
    <div>
      <h2 className="font-display text-[22px] sm:text-[26px] text-soma-black mb-1.5">Sus Datos de Contacto</h2>
      <p className="text-[13px] text-soma-gray mb-6 leading-relaxed">
        Solo necesitamos estos datos para enviarle la cotización.
      </p>

      <div className="rounded-sm p-4 sm:p-5 mb-6 border border-soma-red/30 bg-soma-red/[0.08]">
        <div className="font-label text-[11px] font-bold tracking-[0.2em] uppercase mb-3.5 pb-2.5 border-b border-soma-black/10 text-soma-red">
          Resumen de su Pedido
        </div>
        {resumen.map(([l, v]) => (
          <div key={l} className="flex justify-between mb-2 text-[13px] gap-2">
            <span className="font-label text-[11px] uppercase tracking-[0.08em] text-soma-gray flex-shrink-0">
              {l}
            </span>
            <span className="text-soma-black font-semibold text-right max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        <FormField label="Nombre *" value={nombre} onChange={setNombre} placeholder="Su nombre completo" />
        <FormField label="Empresa" value={empresa} onChange={setEmpresa} placeholder="Nombre de su empresa" />
        <FormField
          label="Teléfono / WhatsApp *"
          value={tel}
          onChange={setTel}
          placeholder="+52 55 0000 0000"
          type="tel"
        />
        <div>
          <div className="font-label text-[10px] font-semibold tracking-[0.12em] uppercase text-soma-gray mb-1.5">
            Tipo de Cliente
          </div>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-sm px-3.5 py-3 text-[14px] text-soma-black bg-white border border-soma-black/15 outline-none"
          >
            <option value="">Seleccionar...</option>
            {tiposCliente.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
