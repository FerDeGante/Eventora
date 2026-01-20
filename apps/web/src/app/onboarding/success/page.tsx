"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/app/hooks/useAuth";

type VerifyResponse = {
  success: boolean;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
  error?: string;
};

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<VerifyResponse["workspace"] | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("No se encontró la sesión de checkout");
      return;
    }

    const verifySession = async () => {
      try {
        const response = await apiFetch<VerifyResponse>("/api/v1/onboarding/verify-session", {
          method: "POST",
          json: { sessionId },
        });

        if (response.success && response.accessToken) {
          auth.setSession(response.accessToken, {
            email: response.user?.email,
            name: response.user?.name,
            role: response.user?.role,
          });
          setWorkspace(response.workspace || null);
          setStatus("success");

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard?welcome=true");
          }, 3000);
        } else {
          throw new Error(response.error || "Error verificando la sesión");
        }
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Error procesando tu suscripción");
      }
    };

    verifySession();
  }, [sessionId, auth, router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.iconLoading}>
              <div style={styles.spinner} />
            </div>
            <h1 style={styles.title}>Configurando tu workspace...</h1>
            <p style={styles.subtitle}>
              Estamos verificando tu pago y preparando todo para ti.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.iconSuccess}>✅</div>
            <h1 style={styles.title}>¡Todo listo!</h1>
            <p style={styles.subtitle}>
              Tu workspace <strong>{workspace?.name}</strong> está activo.
              <br />
              Serás redirigido automáticamente en unos segundos...
            </p>
            <Link href="/dashboard" style={styles.button}>
              Ir al Dashboard →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.iconError}>❌</div>
            <h1 style={styles.title}>Algo salió mal</h1>
            <p style={styles.subtitle}>{error}</p>
            <div style={styles.actions}>
              <Link href="/signup" style={styles.buttonSecondary}>
                Intentar de nuevo
              </Link>
              <Link href="mailto:soporte@eventora.com.mx" style={styles.buttonPrimary}>
                Contactar soporte
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 24,
    padding: "60px 48px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
  },
  iconLoading: {
    marginBottom: 24,
  },
  spinner: {
    width: 60,
    height: 60,
    border: "4px solid #e5e7eb",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  iconSuccess: {
    fontSize: 64,
    marginBottom: 24,
  },
  iconError: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 1.6,
    margin: "0 0 32px",
  },
  button: {
    display: "inline-block",
    padding: "14px 32px",
    borderRadius: 12,
    background: "#6366f1",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    textDecoration: "none",
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  buttonSecondary: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    fontSize: 14,
    textDecoration: "none",
  },
  buttonPrimary: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: 10,
    background: "#6366f1",
    color: "#fff",
    fontWeight: 500,
    fontSize: 14,
    textDecoration: "none",
  },
};
