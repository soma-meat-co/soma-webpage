import { Reveal } from "@/components/Reveal";

const stats = [
  { num: "20", label: "Años de Experiencia" },
  { num: "4", label: "Especies Procesadas" },
  { num: "4", label: "Certificaciones Activas" },
  { num: "100%", label: "Estándares Internacionales" },
];

export function StatsBand() {
  return (
    <Reveal>
      <div className="bg-soma-red flex items-center justify-center" style={{ padding: "28px 80px" }}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex-1 text-center relative" style={{ padding: "0 40px" }}>
            {i < stats.length - 1 && (
              <span className="absolute right-0 top-[20%] bottom-[20%] w-[1px] bg-white/30" />
            )}
            <div className="font-display text-[48px] font-bold text-white leading-none">{s.num}</div>
            <div className="font-label text-[11px] font-medium tracking-[0.2em] uppercase text-white/75 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
