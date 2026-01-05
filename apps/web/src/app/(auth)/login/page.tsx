"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "../../components/ui/AuthCard";
import { InputField } from "../../components/ui/InputField";
import { EventoraButton } from "../../components/ui/EventoraButton";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const auth = useAuth();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const response = await apiFetch<{ accessToken?: string; twoFactorRequired?: boolean }>("/api/v1/auth/login", {
        method: "POST",
        json: { email, password },
      });
      if (response.twoFactorRequired) {
        setTwoFactorRequired(true);
        setStatus("Enviamos un código a tu correo.");
      } else if (response.accessToken) {
        auth.setSession(response.accessToken, { email });
        router.push("/dashboard");
      }
    } catch (error: any) {
      setStatus(`Error: ${error?.message ?? "No pudimos iniciar sesión"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken?: string }>("/api/v1/auth/two-factor/verify", {
        method: "POST",
        json: { email, token: twoFactorCode },
      });
      if (result.accessToken) {
        auth.setSession(result.accessToken, { email });
      }
      router.push("/dashboard");
    } catch (error: any) {
      setStatus(`Error: ${error?.message ?? "Código incorrecto"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={twoFactorRequired ? "Verifica tu acceso" : "Bienvenido de vuelta"}
      subtitle={twoFactorRequired ? "Ingresa el código que enviamos a tu correo" : "Ingresa a Eventora con tu cuenta"}
    >
      <form className="auth-form" onSubmit={twoFactorRequired ? handleVerify : handleLogin}>
        {!twoFactorRequired ? (
          <>
            <InputField label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@eventora.com" />
            <InputField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </>
        ) : (
          <InputField label="Código 2FA" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="123456" />
        )}
        {status && <p className={`auth-status ${status.toLowerCase().includes("error") ? "is-error" : "is-info"}`}>{status}</p>}
        <EventoraButton type="submit" disabled={loading}>
          {loading ? "Procesando..." : twoFactorRequired ? "Confirmar" : "Iniciar sesión"}
        </EventoraButton>
        {!twoFactorRequired && (
          <div className="auth-links">
            <Link href="/register">Crear cuenta</Link>
            <Link href="/reset">¿Olvidaste tu contraseña?</Link>
          </div>
        )}
      </form>
    </AuthCard>
  );
}
