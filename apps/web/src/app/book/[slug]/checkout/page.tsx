"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUxMetrics } from "@/app/hooks/useUxMetrics";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import styles from "./Checkout.module.css";

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
    id?: string;
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

const statusToneMap: Record<string, string> = {
  CONFIRMED: styles.statusSuccess,
  PAID: styles.statusSuccess,
  PENDING: styles.statusWarning,
  UNPAID: styles.statusWarning,
  CANCELLED: styles.statusError,
};

const statusLabelMap: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  UNPAID: "Sin pagar",
  PAID: "Pagado",
  CANCELLED: "Cancelada",
};

// ============================================
// MAIN COMPONENT
// ============================================
function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const bookingId = searchParams.get("booking");
  const paymentStatus = searchParams.get("payment");
  const trackUx = useUxMetrics("booking_checkout");
  const hasTrackedPayment = useRef(false);
  const hasTrackedCancellation = useRef(false);

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingMeta, setBookingMeta] = useState<{
    clinicId?: string;
    serviceId?: string;
    slotStartAt?: string;
    bookingStartedAt?: string;
  } | null>(null);

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

  useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(`eventora-booking-meta:${bookingId}`);
    if (raw) {
      try {
        setBookingMeta(
          JSON.parse(raw) as {
            clinicId?: string;
            serviceId?: string;
            slotStartAt?: string;
            bookingStartedAt?: string;
          }
        );
      } catch {
        setBookingMeta(null);
      }
    }
  }, [bookingId]);

  useEffect(() => {
    if (paymentStatus === "success" && booking && !hasTrackedPayment.current) {
      trackUx("action", {
        event: "payment_completed",
        bookingId: booking.id,
        clinicId: bookingMeta?.clinicId,
        serviceId: bookingMeta?.serviceId ?? booking.service.id,
        slotStartAt: bookingMeta?.slotStartAt,
        eventAt: new Date().toISOString(),
      });
      hasTrackedPayment.current = true;
    }
  }, [paymentStatus, booking, bookingMeta, trackUx]);

  useEffect(() => {
    if (paymentStatus === "cancelled" && booking && !hasTrackedCancellation.current) {
      trackUx("action", {
        event: "payment_cancelled",
        bookingId: booking.id,
        clinicId: bookingMeta?.clinicId,
        serviceId: bookingMeta?.serviceId ?? booking.service.id,
        eventAt: new Date().toISOString(),
      });
      hasTrackedCancellation.current = true;
    }
  }, [paymentStatus, booking, bookingMeta, trackUx]);

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

      trackUx("action", {
        event: "checkout_started",
        bookingId: booking.id,
        clinicId: bookingMeta?.clinicId,
        serviceId: bookingMeta?.serviceId ?? booking.service.id,
        eventAt: new Date().toISOString(),
      });

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
  const containerStyle = {
    "--clinic-color": primaryColor,
    "--clinic-color-dark": adjustColor(primaryColor, -20),
  } as React.CSSProperties;

  const statusClass = (status: string) =>
    `${styles.statusBadge} ${statusToneMap[status] ?? styles.statusNeutral}`;

  const statusLabel = (status: string) => statusLabelMap[status] ?? status;

  // ============================================
  // RENDER STATES
  // ============================================

  // Loading
  if (loading) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Cargando reservación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error && !booking) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.errorContainer} role="alert">
            <p className={styles.errorIcon}>😕</p>
            <p className={styles.errorText}>{error}</p>
            <a href={`/book/${slug}`} className={styles.backLink}>
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
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.header}>
            <h1 className={styles.clinicName}>{booking.clinic.name}</h1>
          </div>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>¡Pago completado!</h2>
            <p className={styles.successMessage}>
              Tu reservación ha sido confirmada. Recibirás un email con los detalles.
            </p>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Detalles de tu cita</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Servicio</span>
                <span className={styles.detailValue}>{booking.service.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>{formatDate(booking.startAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Hora</span>
                <span className={styles.detailValue}>
                  {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ubicación</span>
                <span className={styles.detailValue}>{booking.branch.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Dirección</span>
                <span className={styles.detailValue}>{booking.branch.address}</span>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            Powered by{" "}
            <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
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
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.errorContainer} role="alert">
            <p className={styles.errorText}>No se encontró la reservación</p>
          </div>
        </div>
      </div>
    );
  }

  // Already paid
  if (booking.paymentStatus === "PAID") {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.header}>
            <h1 className={styles.clinicName}>{booking.clinic.name}</h1>
          </div>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Reservación confirmada</h2>
            <p className={styles.successMessage}>Esta reservación ya ha sido pagada.</p>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Detalles de tu cita</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Servicio</span>
                <span className={styles.detailValue}>{booking.service.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>{formatDate(booking.startAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Hora</span>
                <span className={styles.detailValue}>
                  {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ubicación</span>
                <span className={styles.detailValue}>{booking.branch.name}</span>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            Powered by{" "}
            <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
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
    <div className={styles.container} style={containerStyle}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <h1 className={styles.clinicName}>{booking.clinic.name}</h1>
          <p className={styles.headerSubtitle}>Completar pago</p>
        </div>

        <div className={styles.body}>
          {/* Booking Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tu reservación</h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Servicio</span>
              <span className={styles.detailValue}>{booking.service.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Duración</span>
              <span className={styles.detailValue}>{booking.service.durationMinutes} min</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fecha</span>
              <span className={styles.detailValue}>{formatDate(booking.startAt)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Hora</span>
              <span className={styles.detailValue}>
                {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
              </span>
            </div>
            {booking.therapist && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Profesional</span>
                <span className={styles.detailValue}>{booking.therapist}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ubicación</span>
              <span className={styles.detailValue}>{booking.branch.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Dirección</span>
              <span className={styles.detailValue}>{booking.branch.address}</span>
            </div>
          </div>

          {/* Client Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Datos del cliente</h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Nombre</span>
              <span className={styles.detailValue}>{booking.client.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{booking.client.email}</span>
            </div>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total a pagar</span>
              <span className={styles.totalValue}>{formatPrice(booking.service.price)}</span>
            </div>
          </div>

          {/* Status badges */}
          <div className={styles.statusRow}>
            <span className={statusClass(booking.status)}>{statusLabel(booking.status)}</span>
            <span className={statusClass(booking.paymentStatus)}>
              {statusLabel(booking.paymentStatus)}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className={styles.inlineError} role="alert">
              {error}
            </div>
          )}

          {/* Payment cancelled message */}
          {paymentStatus === "cancelled" && (
            <div className={styles.cancelNotice}>
              El pago fue cancelado. Puedes intentar de nuevo.
            </div>
          )}

          {/* Pay button */}
          {booking.canPay && (
            <EventoraButton
              onClick={handlePayment}
              disabled={processingPayment}
              className={styles.payButton}
            >
              {processingPayment ? "Procesando..." : `Pagar ${formatPrice(booking.service.price)}`}
            </EventoraButton>
          )}

          {/* Cannot pay message */}
          {!booking.canPay && booking.paymentStatus === "UNPAID" && (
            <div className={styles.noticeMuted}>
              Los pagos en línea no están disponibles. Contacta al negocio para más información.
            </div>
          )}

          {/* Back link */}
          <div className={styles.backRow}>
            <a href={`/book/${slug}`} className={styles.backLink}>
              ← Hacer otra reservación
            </a>
          </div>
        </div>

        <div className={styles.footer}>
          Powered by{" "}
          <a href="https://eventora.mx" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            Eventora
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.suspenseFallback}>Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
