"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ============================================
// TYPES
// ============================================
type BookingDetails = {
  id: string;
  status: string;
  paymentStatus: string;
  startAt: string;
  endAt: string;
  clinic: {
    name: string;
    slug: string;
    primaryColor: string;
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
  };
  service: {
    name: string;
    price: number;
    durationMinutes: number;
  };
  branch: {
    name: string;
    address: string;
  };
  therapist: string | null;
  client: {
    name: string;
    email: string;
  };
  canPay: boolean;
};

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  widget: {
    maxWidth: "480px",
    margin: "0 auto",
    background: "white",
    borderRadius: "1rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  } as React.CSSProperties,
  header: (color: string) => ({
    background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
    padding: "1.5rem",
    color: "white",
    textAlign: "center" as const,
  }) as React.CSSProperties,
  clinicName: {
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: 0,
  } as React.CSSProperties,
  headerSubtitle: {
    fontSize: "0.875rem",
    opacity: 0.9,
    marginTop: "0.25rem",
  } as React.CSSProperties,
  body: {
    padding: "1.5rem",
  } as React.CSSProperties,
  section: {
    marginBottom: "1.5rem",
    padding: "1rem",
    background: "#f9fafb",
    borderRadius: "0.75rem",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.75rem",
  } as React.CSSProperties,
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  detailRowLast: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
  } as React.CSSProperties,
  detailLabel: {
    color: "#6b7280",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  detailValue: {
    color: "#1f2937",
    fontWeight: 500,
    fontSize: "0.875rem",
    textAlign: "right" as const,
  } as React.CSSProperties,
  priceSection: {
    background: "#fef3c7",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  totalLabel: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#92400e",
  } as React.CSSProperties,
  totalValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#92400e",
  } as React.CSSProperties,
  payButton: (color: string, disabled: boolean) => ({
    width: "100%",
    padding: "1rem",
    border: "none",
    borderRadius: "0.75rem",
    background: disabled ? "#d1d5db" : `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    boxShadow: disabled ? "none" : "0 4px 12px rgba(0, 0, 0, 0.15)",
  }) as React.CSSProperties,
  statusBadge: (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      CONFIRMED: { bg: "#dcfce7", text: "#15803d" },
      PENDING: { bg: "#fef3c7", text: "#92400e" },
      PAID: { bg: "#dcfce7", text: "#15803d" },
      UNPAID: { bg: "#fef3c7", text: "#92400e" },
      CANCELLED: { bg: "#fee2e2", text: "#dc2626" },
    };
    const c = colors[status] || { bg: "#f3f4f6", text: "#6b7280" };
    return {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      background: c.bg,
      color: c.text,
    } as React.CSSProperties;
  },
  successContainer: {
    textAlign: "center" as const,
    padding: "2rem",
  } as React.CSSProperties,
  successIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 1rem",
    background: "#dcfce7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
  } as React.CSSProperties,
  successTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#15803d",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  successMessage: {
    color: "#6b7280",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  footer: {
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center" as const,
    color: "#9ca3af",
    fontSize: "0.75rem",
  } as React.CSSProperties,
  footerLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: 500,
  } as React.CSSProperties,
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    gap: "1rem",
  } as React.CSSProperties,
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
  errorContainer: {
    textAlign: "center" as const,
    padding: "2rem",
    color: "#dc2626",
  } as React.CSSProperties,
  backLink: {
    display: "inline-block",
    marginTop: "1rem",
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
  } as React.CSSProperties,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const bookingId = searchParams.get("booking");
  const paymentStatus = searchParams.get("payment");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setError("No se encontró la reservación");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/public/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error("Reservación no encontrada");
      }
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la reservación");
    } finally {
      setLoading(false);
    }
  }, [bookingId, API_URL]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handlePayment = async () => {
    if (!booking || processingPayment) return;

    setProcessingPayment(true);
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${API_URL}/api/v1/public/bookings/${booking.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: `${baseUrl}/book/${slug}/checkout?booking=${booking.id}&payment=success`,
          cancelUrl: `${baseUrl}/book/${slug}/checkout?booking=${booking.id}&payment=cancelled`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear sesión de pago");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
      setProcessingPayment(false);
    }
  };

  const primaryColor = booking?.clinic?.primaryColor || "#6366f1";

  // ============================================
  // RENDER STATES
  // ============================================

  // Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.widget}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={{ color: "#6b7280" }}>Cargando reservación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error && !booking) {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.errorContainer}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</p>
            <p>{error}</p>
            <a href={`/book/${slug}`} style={styles.backLink}>
              ← Volver a reservar
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Payment success
  if (paymentStatus === "success" && booking) {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.header(primaryColor)}>
            <h1 style={styles.clinicName}>{booking.clinic.name}</h1>
          </div>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>¡Pago completado!</h2>
            <p style={styles.successMessage}>
              Tu reservación ha sido confirmada. Recibirás un email con los detalles.
            </p>
          </div>

          <div style={styles.body}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Detalles de tu cita</h3>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Servicio</span>
                <span style={styles.detailValue}>{booking.service.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Fecha</span>
                <span style={styles.detailValue}>{formatDate(booking.startAt)}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Hora</span>
                <span style={styles.detailValue}>
                  {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Ubicación</span>
                <span style={styles.detailValue}>{booking.branch.name}</span>
              </div>
              <div style={styles.detailRowLast}>
                <span style={styles.detailLabel}>Dirección</span>
                <span style={styles.detailValue}>{booking.branch.address}</span>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            Powered by{" "}
            <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              Eventora
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Booking not found
  if (!booking) {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.errorContainer}>
            <p>No se encontró la reservación</p>
          </div>
        </div>
      </div>
    );
  }

  // Already paid
  if (booking.paymentStatus === "PAID") {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.header(primaryColor)}>
            <h1 style={styles.clinicName}>{booking.clinic.name}</h1>
          </div>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Reservación confirmada</h2>
            <p style={styles.successMessage}>Esta reservación ya ha sido pagada.</p>
          </div>

          <div style={styles.body}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Detalles de tu cita</h3>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Servicio</span>
                <span style={styles.detailValue}>{booking.service.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Fecha</span>
                <span style={styles.detailValue}>{formatDate(booking.startAt)}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Hora</span>
                <span style={styles.detailValue}>
                  {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                </span>
              </div>
              <div style={styles.detailRowLast}>
                <span style={styles.detailLabel}>Ubicación</span>
                <span style={styles.detailValue}>{booking.branch.name}</span>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            Powered by{" "}
            <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              Eventora
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN CHECKOUT VIEW
  // ============================================
  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.widget}>
        <div style={styles.header(primaryColor)}>
          <h1 style={styles.clinicName}>{booking.clinic.name}</h1>
          <p style={styles.headerSubtitle}>Completar pago</p>
        </div>

        <div style={styles.body}>
          {/* Booking Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Tu reservación</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Servicio</span>
              <span style={styles.detailValue}>{booking.service.name}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Duración</span>
              <span style={styles.detailValue}>{booking.service.durationMinutes} min</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Fecha</span>
              <span style={styles.detailValue}>{formatDate(booking.startAt)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Hora</span>
              <span style={styles.detailValue}>
                {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
              </span>
            </div>
            {booking.therapist && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Profesional</span>
                <span style={styles.detailValue}>{booking.therapist}</span>
              </div>
            )}
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Ubicación</span>
              <span style={styles.detailValue}>{booking.branch.name}</span>
            </div>
            <div style={styles.detailRowLast}>
              <span style={styles.detailLabel}>Dirección</span>
              <span style={styles.detailValue}>{booking.branch.address}</span>
            </div>
          </div>

          {/* Client Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Datos del cliente</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Nombre</span>
              <span style={styles.detailValue}>{booking.client.name}</span>
            </div>
            <div style={styles.detailRowLast}>
              <span style={styles.detailLabel}>Email</span>
              <span style={styles.detailValue}>{booking.client.email}</span>
            </div>
          </div>

          {/* Price */}
          <div style={styles.priceSection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total a pagar</span>
              <span style={styles.totalValue}>{formatPrice(booking.service.price)}</span>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", justifyContent: "center" }}>
            <span style={styles.statusBadge(booking.status)}>
              {booking.status === "PENDING" ? "Pendiente" : booking.status === "CONFIRMED" ? "Confirmada" : booking.status}
            </span>
            <span style={styles.statusBadge(booking.paymentStatus)}>
              {booking.paymentStatus === "UNPAID" ? "Sin pagar" : booking.paymentStatus === "PAID" ? "Pagado" : booking.paymentStatus}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ color: "#dc2626", textAlign: "center", marginBottom: "1rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {/* Payment cancelled message */}
          {paymentStatus === "cancelled" && (
            <div style={{ color: "#92400e", textAlign: "center", marginBottom: "1rem", fontSize: "0.875rem", background: "#fef3c7", padding: "0.75rem", borderRadius: "0.5rem" }}>
              El pago fue cancelado. Puedes intentar de nuevo.
            </div>
          )}

          {/* Pay button */}
          {booking.canPay && (
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              style={styles.payButton(primaryColor, processingPayment)}
            >
              {processingPayment ? "Procesando..." : `Pagar ${formatPrice(booking.service.price)}`}
            </button>
          )}

          {/* Cannot pay message */}
          {!booking.canPay && booking.paymentStatus === "UNPAID" && (
            <div style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
              Los pagos en línea no están disponibles. Contacta al negocio para más información.
            </div>
          )}

          {/* Back link */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <a href={`/book/${slug}`} style={styles.backLink}>
              ← Hacer otra reservación
            </a>
          </div>
        </div>

        <div style={styles.footer}>
          Powered by{" "}
          <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
            Eventora
          </a>
        </div>
      </div>
    </div>
  );
}
