interface LanguageToggleProps {
  current: "es" | "en";
  esHref: string;
  enHref: string;
}

export function LanguageToggle({ current, esHref, enHref }: LanguageToggleProps) {
  return (
    <div className="absolute top-20 right-4 sm:top-24 sm:right-10 md:right-20 z-[3] flex gap-1">
      <a
        href={esHref}
        className={
          current === "es"
            ? "font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm bg-soma-red border border-soma-red text-white no-underline"
            : "font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm border border-soma-brown/30 text-soma-brown hover:border-soma-red hover:text-soma-red transition-colors no-underline"
        }
      >
        ES
      </a>
      <a
        href={enHref}
        className={
          current === "en"
            ? "font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm bg-soma-red border border-soma-red text-white no-underline"
            : "font-label text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-sm border border-soma-brown/30 text-soma-brown hover:border-soma-red hover:text-soma-red transition-colors no-underline"
        }
      >
        EN
      </a>
    </div>
  );
}
