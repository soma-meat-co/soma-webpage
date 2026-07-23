export function ConfirmationScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-soma-off-wh">
      <div className="rounded-sm p-8 sm:p-12 text-center max-w-[480px] border-2 border-soma-red bg-soma-red/10">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display text-[26px] sm:text-[32px] text-soma-black mb-3">¡Cotización Enviada!</h2>
        <p className="text-[#555] leading-[1.7] mb-7 text-[14px] sm:text-base">
          Su solicitud fue enviada a nuestro equipo vía WhatsApp. Le respondemos en menos de{" "}
          <strong className="text-soma-black">24 horas hábiles</strong>.
        </p>
        <button
          onClick={onReset}
          className="font-label text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3 border rounded-sm transition-colors duration-200 text-soma-red border-soma-red hover:bg-soma-red hover:text-white"
        >
          Nueva Cotización
        </button>
      </div>
    </div>
  );
}
