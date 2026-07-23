interface CertificationCardProps {
  cert: string;
  full: string;
  body: string;
}

export function CertificationCard({ cert, full, body }: CertificationCardProps) {
  return (
    <div className="flex gap-4 sm:gap-6 p-5 sm:p-8 md:p-10 bg-black/30 border border-white/10 rounded-sm hover:border-soma-red/60 transition-all duration-300">
      <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-full bg-soma-red/20 border-2 border-soma-red flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 fill-soma-red" aria-hidden>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-[19px] sm:text-[24px] font-semibold text-white mb-1">{cert}</h3>
        <p className="font-label text-[9px] sm:text-[10px] tracking-[0.12em] uppercase text-soma-red mb-2 sm:mb-3">{full}</p>
        <p className="text-[13px] sm:text-[14px] text-soma-gray-lt leading-[1.65]">{body}</p>
      </div>
    </div>
  );
}
