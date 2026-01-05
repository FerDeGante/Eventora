"use client";

import { useState, type FormEvent } from "react";
import { AuthCard } from "../../components/ui/AuthCard";
import { InputField } from "../../components/ui/InputField";
import { EventoraButton } from "../../components/ui/EventoraButton";
import { apiFetch } from "@/lib/api-client";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await apiFetch("/api/v1/auth/password/request", {
        method: "POST",
        json: { email },
      });
      setStatus("Enviamos un código a tu correo.");
      setStep("reset");
    } catch (error: any) {
      setStatus(error.message ?? "No pudimos procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await apiFetch("/api/v1/auth/password/reset", {
        method: "POST",
        json: { email, token, newPassword: password },
      });
      setStatus("Contraseña actualizada. Ahora inicia sesión.");
    } catch (error: any) {
      setStatus(error.message ?? "No pudimos actualizar tu contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Recupera tu acceso" subtitle="Te enviaremos un código temporal">
      {step === "request" ? (
        <form className="auth-form" onSubmit={handleRequest}>
          <InputField label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@eventora.com" />
          {status && <p className={`auth-status ${status.startsWith("Enviamos") ? "is-success" : "is-error"}`}>{status}</p>}
          <EventoraButton type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </EventoraButton>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleReset}>
          <InputField label="Código" value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456" />
          <InputField label="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {status && <p className={`auth-status ${status.startsWith("Contraseña") ? "is-success" : "is-error"}`}>{status}</p>}
          <EventoraButton type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </EventoraButton>
        </form>
      )}
    </AuthCard>
  );
}
