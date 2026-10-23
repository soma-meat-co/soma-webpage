"use client"
import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import SomaLogo from "@/assets/icons/soma-logo.svg";

import { authProvider } from "@/lib/core/auth/service/user.service";
import { AuthError, AuthErrorCode } from "@/lib/errors/auth";

/**
 * Login page para SOMA DMS
 * 
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo.");
      return;
    }
    if (!emailPattern.test(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    try {
      await authProvider.login(email, password);
    } catch (err) {
      if (err instanceof AuthError) {
        switch (err.code) {
          case AuthErrorCode.EmailNotConfirmed:
            setError("Confirma tu correo antes de iniciar sesión.");
            break;
          case AuthErrorCode.UserNotFound:
            setError("No existe una cuenta con ese correo.");
            break;
          default:
            setError("Correo o contraseña incorrectos.");
        }
      } else {
        setError("Correo o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] md:min-h-screen w-full flex"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      {/* Side banner de SOMA MEAT CO solo visible en md para arriba*/}
      <div
        className="hidden md:flex lg:w-[30%] flex-col justify-between p-12 relative
        "
      >
        <SomaLogo
          role="img"
          aria-label="SOMA MEAT CO"
          className="object-contain transition-all duration-300"
          style={{ width: "clamp(150px, 250px+ 6.5vw, 350px)", height: "auto"}}
        />
        <style>{`
          #soma-logo-wordmark path {
            fill: var(--color-soma-red) !important;
          }
          #soma-logo-tagline path {
            fill: #ffffff !important;
          }
        `}</style>
        <div className="max-w-sm">
          <h1 className="text-white text-3xl font-bold leading-tight mb-4">
            Control total, del origen al corte.
          </h1>
          <p className="text-sm leading-relaxed text-soma-gray">
            Sistema interno. Acceso restringido a
            personal autorizado de SOMA MEAT CO.
          </p>
        </div>

        {/* Barra de confianza — firma visual mínima, no decorativa */}
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
          style={{ width: "clamp(220px, 300px + 6.5vw, 500px)", height: "auto"}}
        />
        <style>{`
          #soma-logo-wordmark path {
            fill: var(--color-soma-red) !important;
          }
          #soma-logo-tagline path {
            fill: #ffffff !important;
          }
        `}</style>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-soma-brown">
            Iniciar sesión
          </h2>
          <p className="text-sm mb-8 text-soma-gray">
            Ingresa con tu cuenta de equipo.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold mb-1.5 text-soma-brown"
              >
                Correo
              </label>
              <input
                id="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@somameat.co"
                className="w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-soma-brown"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-medium hover:underline text-soma-red"
                  onClick={() => {/* abrir flujo de recuperación */}}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 pr-10 rounded-md border border-[#DAD6CE] bg-white text-sm text-black [word-spacing:0.2em] placeholder:[word-spacing:normal] placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soma-gray"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 bg-soma-red"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <p className="text-[11px] mt-8 text-center text-soma-gray">
            ¿Problemas para acceder? Contacta a tu administrador de área.
          </p>
        </div>
      </div>
    </div>
  );
}