import { ShieldCheck } from "lucide-react";
import SomaLogo from "@/assets/icons/soma-logo.svg";

/**
 * Layout de las pantallas de acceso del DMS: banner de SOMA MEAT CO a la
 * izquierda (desde `md`) y el formulario a la derecha. Es el mismo diseño de
 * `/DMS/login`.
 *
 * @param children - contenido del panel del formulario
 * @returns la pantalla dividida con el banner y el formulario
 * @example
 * <AuthSplitLayout>
 *   <h2>Recupera tu contraseña</h2>
 * </AuthSplitLayout>
 */
export default function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[80vh] md:min-h-screen w-full flex"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <style>{`
        #soma-logo-wordmark path {
          fill: var(--color-soma-red) !important;
        }
        #soma-logo-tagline path {
          fill: #ffffff !important;
        }
      `}</style>

      {/* Side banner de SOMA MEAT CO solo visible en md para arriba */}
      <div className="hidden md:flex lg:w-[30%] flex-col justify-between p-12 relative bg-soma-black">
        <SomaLogo
          role="img"
          aria-label="SOMA MEAT CO"
          className="object-contain transition-all duration-300"
          style={{ width: "clamp(150px, 250px+ 6.5vw, 350px)", height: "auto" }}
        />
        <div className="max-w-sm">
          <h1 className="text-white text-3xl font-bold leading-tight mb-4">
            Control total, del origen al corte.
          </h1>
          <p className="text-sm leading-relaxed text-soma-gray">
            Sistema interno. Acceso restringido a
            personal autorizado de SOMA MEAT CO.
          </p>
        </div>

        <div
          className="flex items-center gap-2 pt-6 border-t"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <ShieldCheck size={16} className="text-soma-gray" />
          <p className="text-xs text-soma-gray">
            TIF 845 · HACCP · Trazabilidad documentada
          </p>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-soma-off-wh">
        <div className="w-full max-w-sm">
          {/* Marca visible solo en mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <SomaLogo
              role="img"
              aria-label="SOMA MEAT CO"
              className="object-contain transition-all duration-300"
              style={{ width: "clamp(220px, 300px + 6.5vw, 500px)", height: "auto" }}
            />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
