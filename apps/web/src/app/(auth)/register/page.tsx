"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "../../components/ui/AuthCard";
import { InputField } from "../../components/ui/InputField";
import { EventoraButton } from "../../components/ui/EventoraButton";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const auth = useAuth();

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken?: string }>("/api/v1/auth/register", {
        method: "POST",
        json: form,
      });
      if (result.accessToken) {
        auth.setSession(result.accessToken, { email: form.email, name: form.name });
        router.push("/dashboard");
      } else {
        setStatus("Cuenta creada. Revisa tu correo y luego inicia sesión.");
        setTimeout(() => router.push("/login"), 800);
      }
    } catch (error: any) {
      setStatus(error.message ?? "No pudimos crear tu cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Activa Eventora para tu clínica o staff">
      <form className="auth-form" onSubmit={handleRegister}>
        <InputField label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eventora Admin" />
        <InputField label="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@eventora.com" />
        <InputField label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="55 0000 0000" />
        <InputField label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        {status && <p className={`auth-status ${status.startsWith("Cuenta") ? "is-success" : "is-error"}`}>{status}</p>}
        <EventoraButton type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </EventoraButton>
        <div className="auth-links auth-links--center">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </div>
      </form>
    </AuthCard>
  );
}
