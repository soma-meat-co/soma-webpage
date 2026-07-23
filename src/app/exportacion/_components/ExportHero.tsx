import Image from "next/image";
import { withBasePath } from "@/lib/basePath";

export function ExportHero() {
  return (
    <div className="flex items-center relative overflow-hidden px-6 pt-10 pb-10">
      <div
        className="absolute"
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

      <div className="relative z-[3] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full max-w-[1200px] mx-auto">
        <div className="relative order-1 md:order-2 w-full h-[220px] sm:h-[300px] md:h-[440px] rounded-sm overflow-hidden">
          <Image
            src={withBasePath("/servicios-hero.png")}
            alt="SOMA MEAT CO — Export Division"
            fill
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: "linear-gradient(180deg, rgba(13,11,9,0.15) 0%, rgba(13,11,9,0.75) 100%)" }}
          />
        </div>

        <div className="relative order-2 md:order-1 max-w-[560px] -mt-16 sm:-mt-20 md:mt-0 z-[1]">
          <div className="flex items-center gap-3 mb-5 sm:mb-7">
            <span className="block w-8 sm:w-10 h-[1px] bg-soma-red" />
            <span className="font-label text-[10px] sm:text-[12px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-soma-red">
              Teoloyucan, Mexico · Export Division
            </span>
          </div>
          <h1
            className="font-display font-semibold leading-none text-white mb-4 sm:mb-6"
            style={{ fontSize: "clamp(34px, 6.5vw, 72px)" }}
          >
            Mexico&apos;s Premium{" "}
            <em className="text-soma-red not-italic">Lamb</em>{" "}
            for Global Markets
          </h1>
          <p className="text-[14px] sm:text-[17px] font-light leading-[1.7] sm:leading-[1.8] text-soma-gray-lt mb-8 sm:mb-12">
            TIF 422 certified processing plant with HACCP authorization for export. Premium lamb
            and meat cuts available with Kosher and Halal certification — ready for international
            buyers.
          </p>
          <div className="flex gap-3 sm:gap-4 flex-wrap">
            <a
              href="mailto:export@somameat.com"
              className="font-label text-[12px] sm:text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-soma-red border-2 border-soma-red px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:bg-transparent hover:text-soma-red transition-all duration-200 no-underline"
            >
              Contact Export Team
            </a>
            <a
              href="/cotizacion"
              className="font-label text-[12px] sm:text-[13px] font-semibold tracking-[0.12em] uppercase text-white bg-transparent border-2 border-white/25 px-6 py-3 sm:px-9 sm:py-4 rounded-sm hover:border-white transition-all duration-200 no-underline"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
