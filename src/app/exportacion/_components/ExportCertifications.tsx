import { Reveal } from "@/components/Reveal";
import { CertificationCard } from "@/components/ui/CertificationCard";
import { certifications } from "../_data";

export function ExportCertifications() {
  return (
    <section
      className="bg-soma-black px-4 py-16 sm:px-10 sm:py-20 md:px-20 md:py-24"
      style={{ backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(172,31,37,0.25) 0%, transparent 50%)" }}
    >
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-7 h-[2px] bg-soma-red" />
          <span className="font-label text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-soma-red">Quality Assurance</span>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-semibold text-white leading-[1.1] mb-4 sm:mb-5" style={{ fontSize: "clamp(28px, 4vw, 56px)" }}>
          Certifications That Open Doors
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-[14px] sm:text-[16px] font-light leading-[1.7] sm:leading-[1.75] text-soma-gray max-w-[540px] mb-10 sm:mb-[60px]">
          Our certifications are the result of audited processes, trained staff, and a culture
          of food safety throughout every stage of production.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {certifications.map((c, i) => (
          <Reveal key={c.cert} delay={0.1 * i}>
            <CertificationCard cert={c.cert} full={c.full} body={c.body} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
