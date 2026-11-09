"use client"
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const INPUT_CLASS =
  "w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red";
const LABEL_CLASS = "block text-xs font-semibold mb-1.5 text-soma-brown";

/**
 * Formulario para que un administrador invite a un usuario al DMS. El acceso a
 * esta ruta lo controla `src/proxy.ts`.
 *
 * @returns el formulario de invitación o la confirmación de envío
 */
export default function InviteUserPage() {
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(Javier): validar e invocar la Edge Function invite-user-as-admin.
  };

  const handleInviteAnother = () => {
    setNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setEmail("");
    setDone(false);
  };

  return (
    <div
      className="mx-auto w-full max-w-md px-6 py-10"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <Link
        href="/DMS"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-8 text-soma-gray hover:text-soma-brown transition-colors"
      >
        <ArrowLeft size={14} />
        Volver al inicio
      </Link>

      {done ? (
        <>
          <CheckCircle2 size={32} className="text-soma-red mb-4" />
          <h1 className="text-2xl font-bold mb-1 text-soma-brown">Invitación enviada</h1>
          <p className="text-sm mb-8 text-soma-gray">
            Enviamos el enlace de activación a <span className="font-semibold">{email}</span>.
          </p>
          <button
            type="button"
            onClick={handleInviteAnother}
            className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white flex items-center justify-center bg-soma-red"
          >
            Invitar a otra persona
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1 text-soma-brown">Invitar usuario</h1>
          <p className="text-sm mb-8 text-soma-gray">
            La persona recibirá un correo para activar su cuenta.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="nombre" className={LABEL_CLASS}>
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="off"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ana"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="apellido-paterno" className={LABEL_CLASS}>
                  Apellido paterno
                </label>
                <input
                  id="apellido-paterno"
                  type="text"
                  autoComplete="off"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  placeholder="López"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="apellido-materno" className={LABEL_CLASS}>
                  Apellido materno <span className="font-normal text-soma-gray">(opcional)</span>
                </label>
                <input
                  id="apellido-materno"
                  type="text"
                  autoComplete="off"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={LABEL_CLASS}>
                Correo institucional
              </label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@somameat.com"
                className={INPUT_CLASS}
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
              {loading ? "Enviando..." : "Enviar invitación"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
