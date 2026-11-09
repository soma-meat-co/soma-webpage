"use client"
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import AuthSplitLayout from "@/components/DMS/AuthSplitLayout";

import { authProvider } from "@/lib/core/auth/service/user.service";
import { AuthError, AuthErrorCode } from "@/lib/errors/auth";

/**
 * Página a la que llega el usuario desde el correo de invitación
 * (`supabase/templates/invite.html`). El link trae `token_hash` y `type=invite`.
 */
export default function SetPasswordPage() {
  // useSearchParams requiere un Suspense boundary para que el build no falle.
  return (
    <AuthSplitLayout>
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const isInviteLink = tokenHash !== null && searchParams.get("type") === "invite";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Ingresa una contraseña.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await authProvider.acceptInvite(tokenHash!, password);
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError && err.code === AuthErrorCode.LinkInvalid) {
        setError("El link no es válido o ya expiró. Pide a tu administrador una nueva invitación.");
      } else if (err instanceof AuthError && err.code === AuthErrorCode.WeakPassword) {
        setError("Usa al menos 8 caracteres, un número y un símbolo especial.");
      } else {
        setError("No se pudo establecer la contraseña. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        {!isInviteLink ? (
          <>
            <h2 className="text-2xl font-bold mb-1 text-soma-brown">Link inválido</h2>
            <p className="text-sm mb-8 text-soma-gray">
              Abre esta página desde el botón del correo de invitación.
            </p>
          </>
        ) : done ? (
          <>
            <CheckCircle2 size={32} className="text-soma-red mb-4" />
            <h2 className="text-2xl font-bold mb-1 text-soma-brown">Cuenta activada</h2>
            <p className="text-sm mb-8 text-soma-gray">
              Tu contraseña quedó establecida. Ya puedes iniciar sesión.
            </p>
            <Link
              href="/DMS/login"
              className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center bg-soma-red"
            >
              Ir a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1 text-soma-brown">Establece tu contraseña</h2>
            <p className="text-sm mb-8 text-soma-gray">
              Es el último paso para activar tu cuenta.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold mb-1.5 text-soma-brown">
                  Contraseña nueva
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3 pr-10 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
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

              <div>
                <label htmlFor="confirmation" className="block text-xs font-semibold mb-1.5 text-soma-brown">
                  Confirma la contraseña
                </label>
                <input
                  id="confirmation"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
                />
              </div>

              {error && (
                <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 bg-soma-red"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Guardando..." : "Activar mi cuenta"}
              </button>
            </form>
          </>
        )}
    </>
  );
}
