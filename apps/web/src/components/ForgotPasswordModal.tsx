import { useState } from "react";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ show, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    token: "",
    password: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Paso 1: Solicitar código
  const handleSendToken = async () => {
    setError(null);
    setStatus("Enviando código...");
    try {
      const res = await fetch("/api/auth/request-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, checkUser: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setStatus("Código enviado a tu correo.");
      } else {
        setError(data.error || "No se pudo enviar el código.");
        setStatus(null);
      }
    } catch {
      setError("Error de red, intenta de nuevo.");
      setStatus(null);
    }
  };

  // Paso 2: Validar token y cambiar contraseña
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus("Cambiando contraseña...");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          token: form.token,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Contraseña cambiada. Ya puedes iniciar sesión.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || "No se pudo cambiar la contraseña.");
        setStatus(null);
      }
    } catch {
      setError("Error de red, intenta de nuevo.");
      setStatus(null);
    }
  };

  if (!show) return null;

  return (
    <div className="bloom-modal-backdrop">
      <div className="bloom-modal-card">
        <button className="bloom-modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <div className="text-center mb-3">
          <img
            src="/images/logo_bloom_clean.png"
            alt="Eventora Fisio"
            style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 14, background: "#fff" }}
          />
          <h3 style={{ color: "var(--primary)", fontWeight: 700 }}>¿Olvidaste tu contraseña?</h3>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {status && <div className="alert alert-success">{status}</div>}
        <form onSubmit={handleResetPassword}>
          {step === 1 && (
            <>
              <div className="form-floating mb-3">
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Tu correo"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Correo electrónico</label>
              </div>
              <button
                type="button"
                className="btn btn-orange w-100 mb-2"
                onClick={handleSendToken}
              >
                Enviar código
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="form-floating mb-3">
                <input
                  name="token"
                  type="text"
                  className="form-control"
                  placeholder="Código recibido"
                  value={form.token}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="token">Código recibido</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Nueva contraseña</label>
              </div>
              <button type="submit" className="btn btn-orange w-100">
                Cambiar contraseña
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}