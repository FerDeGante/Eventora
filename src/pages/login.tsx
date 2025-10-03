import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Modal de recuperación
  const [showReset, setShowReset] = useState(false);

  return (
    <>
      <Head>
        <title>Iniciar Sesión • Bloom Fisio</title>
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      <div
        className="vh-100 d-flex justify-content-center align-items-center"
        style={{
          background:
            "linear-gradient(120deg, #e8f6f8 0%, #f7e8fb 100%)",
          minHeight: "100vh",
        }}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const res = await signIn("credentials", {
              redirect: false,
              email,
              password,
            });
            setLoading(false);
            if (res?.error) {
              setError(
                res.error === "CredentialsSignin"
                  ? "Error: correo o contraseña incorrectos."
                  : res.error
              );
            } else {
              const session = await getSession();
              let target = "/dashboard?tab=reservar";
              if (session?.user?.role === "ADMIN") target = "/admin";
              else if (session?.user?.role === "THERAPIST")
                target = "/therapist";
              window.location.href = target;
            }
          }}
          className="contact-card p-4"
          style={{
            maxWidth: 400,
            width: "100%",
            borderRadius: 22,
            boxShadow: "0 8px 32px #60bac230",
            background: "#fff",
            border: "2.8px solid #e7bbee",
          }}
        >
          <div className="text-center mb-2">
            <Image
              src="/images/logo_bloom_clean.png"
              alt="Bloom Fisio"
              width={74}
              height={54}
              style={{
                borderRadius: 14,
                background: "#fff",
                boxShadow: "0 1px 8px #0001",
                marginBottom: 10,
                marginTop: -8,
              }}
              priority
            />
          </div>
          <h2
            className="text-center"
            style={{
              color: "#60bac2",
              fontWeight: 800,
              marginBottom: "1.4rem",
            }}
          >
            Iniciar Sesión
          </h2>
          {error && (
            <div
              className="alert alert-danger"
              style={{ borderRadius: 12, padding: 8, marginBottom: 12 }}
            >
              {error}
            </div>
          )}
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Correo"
            required
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            style={{
              borderRadius: 14,
              border: "2px solid #aee6e8",
              background: "#f8fcff",
              marginBottom: 16,
            }}
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              borderRadius: 14,
              border: "2px solid #aee6e8",
              background: "#f8fcff",
              marginBottom: 16,
            }}
          />
          <button
            className="btn btn-orange w-100"
            style={{
              borderRadius: 18,
              background:
                "linear-gradient(90deg, #aee6e8, #e7bbee 90%)",
              color: "#3b5566",
              fontWeight: 700,
              fontSize: "1.13rem",
              marginBottom: 10,
              boxShadow: "0 6px 32px #c9e9ff33",
              border: "none",
              padding: "0.9rem 0",
              letterSpacing: "-0.5px",
            }}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
          <div className="text-center mt-3" style={{ fontSize: "1rem" }}>
            <span
              className="text-link"
              style={{
                cursor: "pointer",
                color: "#60bac2",
                fontWeight: 600,
              }}
              onClick={() => setShowReset(true)}
            >
              ¿Olvidaste tu contraseña?
            </span>
            <br />
            <Link
              href="/register"
              style={{
                color: "#b983e5",
                textDecoration: "underline",
                fontWeight: 500,
                fontSize: "0.98rem",
              }}
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
        <ForgotPasswordModal show={showReset} onClose={() => setShowReset(false)} />
      </div>
    </>
  );
}

// --- Modal como sub-componente ---
function ForgotPasswordModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  // Envío de código
  const handleSendToken = async () => {
    setResetStatus("Enviando código...");
    setResetError(null);
    const res = await fetch("/api/auth/request-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, checkUser: true, purpose: "reset" }),
    });
    const data = await res.json();
    if (res.ok) {
      setStep(2);
      setResetStatus("Código enviado a tu correo.");
    } else {
      setResetError(data.error || "No se pudo enviar el código.");
      setResetStatus(null);
    }
  };

  // Cambia contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus("Guardando...");
    setResetError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: resetEmail,
        token: resetToken,
        password: newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setResetStatus("¡Contraseña cambiada! Ahora puedes iniciar sesión.");
      setTimeout(onClose, 2000);
    } else {
      setResetError(data.error || "No se pudo cambiar la contraseña.");
      setResetStatus(null);
    }
  };

  if (!show) return null;
  return (
    <div className="bloom-modal-backdrop">
      <div
        className="bloom-modal-card"
        style={{
          minWidth: 320,
          borderRadius: 18,
          border: "2.2px solid #aee6e8",
          background: "#fff",
        }}
      >
        <button
          className="bloom-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <div className="text-center mb-3">
          <Image
            src="/images/logo_bloom_clean.png"
            alt="Bloom Fisio"
            width={48}
            height={48}
            style={{
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 1px 8px #0001",
              marginBottom: 10,
            }}
            priority
          />
          <h3 style={{ color: "#60bac2", fontWeight: 700 }}>
            Recupera tu contraseña
          </h3>
        </div>
        {resetError && (
          <div
            className="alert alert-danger"
            style={{ borderRadius: 10, padding: 7, marginBottom: 10 }}
          >
            {resetError}
          </div>
        )}
        {resetStatus && (
          <div
            className="alert alert-success"
            style={{ borderRadius: 10, padding: 7, marginBottom: 10 }}
          >
            {resetStatus}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="form-floating mb-3">
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{
                  borderRadius: 12,
                  border: "2px solid #aee6e8",
                  background: "#f8fcff",
                }}
              />
              <label htmlFor="resetEmail">Correo electrónico</label>
            </div>
            <button
              className="btn btn-orange w-100"
              style={{
                borderRadius: 16,
                background:
                  "linear-gradient(90deg, #aee6e8, #e7bbee 90%)",
                color: "#3b5566",
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: 4,
                border: "none",
                padding: "0.85rem 0",
              }}
              onClick={handleSendToken}
            >
              Enviar código
            </button>
          </>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-floating mb-3">
              <input
                id="resetToken"
                name="resetToken"
                type="text"
                className="form-control"
                placeholder="Código recibido"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                style={{
                  borderRadius: 12,
                  border: "2px solid #aee6e8",
                  background: "#f8fcff",
                }}
              />
              <label htmlFor="resetToken">Código recibido</label>
            </div>
            <div className="form-floating mb-3">
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                id="newPassword"
                name="newPassword"
                placeholder="Nueva contraseña"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-orange w-100"
              style={{
                borderRadius: 16,
                background:
                  "linear-gradient(90deg, #aee6e8, #e7bbee 90%)",
                color: "#3b5566",
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: 4,
                border: "none",
                padding: "0.85rem 0",
              }}
            >
              Cambiar contraseña
            </button>
          </form>
        )}
        <button
          className="btn btn-link mt-3 w-100"
          style={{ color: "#888" }}
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
