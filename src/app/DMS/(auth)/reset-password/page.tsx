"use client"
import { Suspense, useState } from "react";
import { AuthError, AuthErrorCode } from "@/lib/errors/auth";
import { authProvider } from "@/lib/core/auth/service/user.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import AuthSplitLayout from "@/components/DMS/AuthSplitLayout";

const INPUT_CLASS =
  "w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red";
const LABEL_CLASS = "block text-xs font-semibold mb-1.5 text-soma-brown";
const SUBMIT_CLASS =
  "w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 bg-soma-red";

/**
 * Recuperación de contraseña. Sin token pide el correo; con el link del correo
 * de recuperación (`token_hash` y `type=recovery`) pide la contraseña nueva.
 *
 * @returns la pantalla que corresponde al paso de la recuperación
 */
export default function ResetPasswordPage() {
  // useSearchParams requiere un Suspense boundary para que el build no falle.
  return (
    <AuthSplitLayout>
      <Suspense>
        <ResetPasswordStep />
      </Suspense>
    </AuthSplitLayout>
  );
}

/**
 * Elige el paso a mostrar según los parámetros del link.
 *
 * @returns el formulario de contraseña nueva o el de solicitud
 */
function ResetPasswordStep() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const isRecoveryLink = tokenHash !== null && searchParams.get("type") === "recovery";

  return isRecoveryLink ? <NewPasswordForm tokenHash={tokenHash} /> : <RequestResetForm />;
}

/**
 * Pide el correo al que se enviará el link de recuperación.
 *
 * @returns el formulario de solicitud o la confirmación de envío
 */
function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
        if (!email.trim()) {
          setError("Ingresa tu correo.");
          return;
        }
        if (!emailPattern.test(email)){
          setError("Ingresa un correo válido.");
          return;
        }
        setLoading(true);
        try {
          await authProvider.requestPasswordReset(email);
        } catch (err) {
          if (err instanceof AuthError) {
            switch (err.code) {
              case AuthErrorCode.PasswordResetRequestError:
                setError("No se pudo enviar el correo.");
                break;
            }
          } else {
            setError("No se pudo enviar el correo.");
          }
        } finally {
          setLoading(false);
          setDone(true);
        }
  };

  if (done) {
    return (
      <>
        <CheckCircle2 size={32} className="text-soma-red mb-4" />
        <h2 className="text-2xl font-bold mb-1 text-soma-brown">Revisa tu correo</h2>
        <p className="text-sm mb-8 text-soma-gray">
          Si encontramos tu correo electrónico, recibirás un correo de recuperación con un enlace para crear una contraseña nueva.
        </p>
        <Link
          href="/DMS/login"
          className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center bg-soma-red"
        >
          Volver a iniciar sesión
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/DMS/login"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-8 text-soma-gray hover:text-soma-brown transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a iniciar sesión
      </Link>

      <h2 className="text-2xl font-bold mb-1 text-soma-brown">Recupera tu contraseña</h2>
      <p className="text-sm mb-8 text-soma-gray">
        Te enviaremos un enlace para crear una contraseña nueva.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@somameat.com"
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
        )}

        <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </>
  );
}

/**
 * Pide la contraseña nueva a quien llegó desde el correo de recuperación.
 *
 * @param tokenHash - token del link de recuperación
 * @returns el formulario de contraseña nueva o la confirmación
 */
function NewPasswordForm({ tokenHash }: { tokenHash: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()){
      setError("Ingresa una contrasena");
      return
    }
    setLoading(true); 
    try{
      await authProvider.setNewPassword(tokenHash, password);
    } catch (err) {
      if (err instanceof AuthError) {
        switch (err.code) {
          case AuthErrorCode.WeakPassword:
            setError("Seleciona una contraseña más fuerte.");
            return;
          case AuthErrorCode.NewPasswordError:
            setError("No pudimso establecer una nueva contraseña. Intenta de nuevo.");
            return;
          default: 
            setError("No pudimso establecer una nueva contraseña. Intenta de nuevo.");
            return;
        }
      } else {
        setError("No pudimso establecer una nueva contraseña. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
      setDone(true);
    }
  };

  if (done) {
    return (
      <>
        <CheckCircle2 size={32} className="text-soma-red mb-4" />
        <h2 className="text-2xl font-bold mb-1 text-soma-brown">Contraseña actualizada</h2>
        <p className="text-sm mb-8 text-soma-gray">
          Ya puedes iniciar sesión con tu contraseña nueva.
        </p>
        <Link
          href="/DMS/login"
          className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center bg-soma-red"
        >
          Ir a iniciar sesión
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-1 text-soma-brown">Crea una contraseña nueva</h2>
      <p className="text-sm mb-8 text-soma-gray">
        Úsala la próxima vez que inicies sesión.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>
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
              className={`${INPUT_CLASS} pr-10`}
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
          <label htmlFor="confirmation" className={LABEL_CLASS}>
            Confirma la contraseña
          </label>
          <input
            id="confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="••••••••"
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
        )}

        <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </>
  );
}
