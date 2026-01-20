"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

// ============================================
// TYPES
// ============================================
type Service = {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: number;
  category?: { name: string; colorHex: string | null };
};

type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  notes: string;
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
    maxWidth: "600px",
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
  steps: {
    display: "flex",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    gap: "0.5rem",
  } as React.CSSProperties,
  step: (active: boolean, completed: boolean) => ({
    flex: 1,
    textAlign: "center" as const,
    padding: "0.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    background: completed ? "#dcfce7" : active ? "#eef2ff" : "#f9fafb",
    color: completed ? "#15803d" : active ? "#6366f1" : "#9ca3af",
    transition: "all 0.2s ease",
  }) as React.CSSProperties,
  body: {
    padding: "1.5rem",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "1rem",
  } as React.CSSProperties,
  servicesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  } as React.CSSProperties,
  serviceCard: (selected: boolean) => ({
    padding: "1rem",
    border: selected ? "2px solid #6366f1" : "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: selected ? "#eef2ff" : "white",
  }) as React.CSSProperties,
  serviceName: {
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  serviceDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    color: "#6b7280",
  } as React.CSSProperties,
  servicePrice: {
    fontWeight: 600,
    color: "#059669",
  } as React.CSSProperties,
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  calendarDay: {
    textAlign: "center" as const,
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: 500,
    padding: "0.5rem",
  } as React.CSSProperties,
  calendarDate: (selected: boolean, isToday: boolean, hasSlots: boolean, isPast: boolean) => ({
    textAlign: "center" as const,
    padding: "0.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: hasSlots && !isPast ? "pointer" : "default",
    background: selected ? "#6366f1" : isToday ? "#eef2ff" : hasSlots ? "white" : "#f9fafb",
    color: selected ? "white" : isPast || !hasSlots ? "#d1d5db" : "#374151",
    border: isToday && !selected ? "2px solid #6366f1" : "1px solid transparent",
    transition: "all 0.15s ease",
  }) as React.CSSProperties,
  timeSlotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.5rem",
  } as React.CSSProperties,
  timeSlot: (selected: boolean, available: boolean) => ({
    padding: "0.75rem",
    border: selected ? "2px solid #6366f1" : "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    textAlign: "center" as const,
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: available ? "pointer" : "default",
    background: selected ? "#eef2ff" : available ? "white" : "#f9fafb",
    color: selected ? "#6366f1" : available ? "#374151" : "#d1d5db",
    transition: "all 0.15s ease",
  }) as React.CSSProperties,
  formGroup: {
    marginBottom: "1rem",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    minHeight: "80px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  footer: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
  } as React.CSSProperties,
  primaryButton: (color: string) => ({
    flex: 1,
    background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
    color: "white",
    border: "none",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.875rem",
    boxShadow: `0 2px 8px ${color}40`,
  }) as React.CSSProperties,
  secondaryButton: {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  summary: {
    background: "#f9fafb",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    padding: "0.375rem 0",
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  summaryLabel: {
    color: "#6b7280",
  } as React.CSSProperties,
  summaryValue: {
    fontWeight: 500,
    color: "#1f2937",
  } as React.CSSProperties,
  successContainer: {
    textAlign: "center" as const,
    padding: "2rem",
  } as React.CSSProperties,
  successIcon: {
    width: "64px",
    height: "64px",
    background: "#dcfce7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    color: "#15803d",
  } as React.CSSProperties,
  successTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  calendarNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  } as React.CSSProperties,
  calendarNavButton: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  calendarMonth: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1f2937",
  } as React.CSSProperties,
  loading: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    color: "#6b7280",
  } as React.CSSProperties,
  errorContainer: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
  } as React.CSSProperties,
  errorTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#dc2626",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
};

// Helper to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ============================================
// ICONS
// ============================================
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

// ============================================
// COMPONENT
// ============================================
export default function BookingWidget() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Clinic data
  const [clinic, setClinic] = useState<{
    id: string;
    name: string;
    primaryColor: string;
    branchId: string;
  } | null>(null);

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Success
  const [bookingId, setBookingId] = useState<string | null>(null);

  // API base
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Load clinic and services
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load clinic by slug
      const clinicRes = await fetch(`${apiBase}/api/v1/public/clinics/${slug}`);
      if (!clinicRes.ok) {
        throw new Error("Clínica no encontrada");
      }
      const clinicData = await clinicRes.json();
      setClinic({
        id: clinicData.id,
        name: clinicData.name,
        primaryColor: clinicData.primaryColor || "#6366f1",
        branchId: clinicData.branches?.[0]?.id || "",
      });

      // Load services
      const servicesRes = await fetch(`${apiBase}/api/v1/catalog/services`, {
        headers: { "x-clinic-id": clinicData.id },
      });
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [slug, apiBase]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load time slots when date changes
  const loadTimeSlots = useCallback(async () => {
    if (!selectedDate || !selectedService || !clinic) return;

    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(
        `${apiBase}/api/v1/availability?date=${dateStr}&serviceId=${selectedService.id}`,
        { headers: { "x-clinic-id": clinic.id } }
      );
      if (res.ok) {
        const data = await res.json();
        setTimeSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedService, clinic, apiBase]);

  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  // Format price
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Format time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle submit - Use public endpoint for bookings
  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot || !clinic) return;
    if (!formData.name || !formData.email) {
      setError("Nombre y email son requeridos");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use public booking endpoint (no auth required)
      const res = await fetch(`${apiBase}/api/v1/public/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: clinic.id,
          branchId: clinic.branchId || "",
          serviceId: selectedService.id,
          startAt: selectedSlot.start,
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone || undefined,
          notes: formData.notes || undefined,
          requiresPayment: selectedService.basePrice > 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la reservación");
      }

      const data = await res.json();
      setBookingId(data.id);

      // If requires payment, redirect to checkout
      if (data.requiresPayment && data.amount > 0) {
        window.location.href = `/book/${slug}/checkout?booking=${data.id}`;
        return;
      }

      // Otherwise show confirmation
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Error al crear la reservación");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.loading}>Cargando...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !clinic) {
    return (
      <div style={styles.container}>
        <div style={styles.widget}>
          <div style={styles.errorContainer}>
            <div style={styles.errorTitle}>Error</div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = clinic?.primaryColor || "#6366f1";

  return (
    <div style={styles.container}>
      <div style={styles.widget}>
        {/* Header */}
        <div style={styles.header(primaryColor)}>
          <h1 style={styles.clinicName}>{clinic?.name || "Reservar Cita"}</h1>
          <p style={styles.headerSubtitle}>Agenda tu cita en línea</p>
        </div>

        {/* Steps */}
        <div style={styles.steps}>
          <div style={styles.step(step === 1, step > 1)}>1. Servicio</div>
          <div style={styles.step(step === 2, step > 2)}>2. Fecha y Hora</div>
          <div style={styles.step(step === 3, step > 3)}>3. Datos</div>
          <div style={styles.step(step === 4, false)}>4. Confirmado</div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Step 1: Select Service */}
          {step === 1 && (
            <>
              <h2 style={styles.sectionTitle}>Selecciona un servicio</h2>
              <div style={styles.servicesList}>
                {services.length === 0 ? (
                  <p style={{ color: "#6b7280", textAlign: "center" }}>
                    No hay servicios disponibles
                  </p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      style={styles.serviceCard(selectedService?.id === service.id)}
                      onClick={() => setSelectedService(service)}
                    >
                      <div style={styles.serviceName}>{service.name}</div>
                      {service.description && (
                        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0" }}>
                          {service.description}
                        </p>
                      )}
                      <div style={styles.serviceDetails}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <ClockIcon /> {formatDuration(service.defaultDuration)}
                        </span>
                        <span style={styles.servicePrice}>
                          {formatPrice(service.basePrice)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <>
              <h2 style={styles.sectionTitle}>Selecciona fecha y hora</h2>

              {/* Calendar Navigation */}
              <div style={styles.calendarNav}>
                <button
                  style={styles.calendarNavButton}
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                  }
                >
                  <ChevronLeftIcon />
                </button>
                <span style={styles.calendarMonth}>
                  {currentMonth.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                </span>
                <button
                  style={styles.calendarNavButton}
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                  }
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Calendar Grid */}
              <div style={styles.calendarGrid}>
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div key={day} style={styles.calendarDay}>
                    {day}
                  </div>
                ))}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isPast = date < today;
                  const isToday = date.getTime() === today.getTime();
                  const isSelected = selectedDate?.getTime() === date.getTime();
                  const hasSlots = !isPast; // Simplified - in real app, check availability

                  return (
                    <div
                      key={day}
                      style={styles.calendarDate(isSelected, isToday, hasSlots, isPast)}
                      onClick={() => {
                        if (!isPast && hasSlots) {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <>
                  <h3 style={{ ...styles.sectionTitle, marginTop: "1rem" }}>
                    Horarios disponibles - {formatDate(selectedDate)}
                  </h3>
                  {loadingSlots ? (
                    <p style={{ color: "#6b7280", textAlign: "center" }}>Cargando horarios...</p>
                  ) : timeSlots.length === 0 ? (
                    <p style={{ color: "#6b7280", textAlign: "center" }}>
                      No hay horarios disponibles para esta fecha
                    </p>
                  ) : (
                    <div style={styles.timeSlotsGrid}>
                      {timeSlots.map((slot, i) => (
                        <div
                          key={i}
                          style={styles.timeSlot(selectedSlot === slot, slot.available)}
                          onClick={() => slot.available && setSelectedSlot(slot)}
                        >
                          {formatTime(slot.start)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Step 3: Enter Details */}
          {step === 3 && (
            <>
              <h2 style={styles.sectionTitle}>Ingresa tus datos</h2>

              {/* Summary */}
              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Servicio</span>
                  <span style={styles.summaryValue}>{selectedService?.name}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Fecha</span>
                  <span style={styles.summaryValue}>
                    {selectedDate && formatDate(selectedDate)}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Hora</span>
                  <span style={styles.summaryValue}>
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                  <span style={styles.summaryLabel}>Precio</span>
                  <span style={{ ...styles.summaryValue, color: "#059669", fontWeight: 600 }}>
                    {selectedService && formatPrice(selectedService.basePrice)}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre completo *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notas adicionales</label>
                <textarea
                  style={styles.textarea}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="¿Algo que debamos saber?"
                />
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>
                <CheckIcon />
              </div>
              <h2 style={styles.successTitle}>¡Reservación Confirmada!</h2>
              <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                Te hemos enviado un email de confirmación a{" "}
                <strong>{formData.email}</strong>
              </p>

              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Servicio</span>
                  <span style={styles.summaryValue}>{selectedService?.name}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Fecha</span>
                  <span style={styles.summaryValue}>
                    {selectedDate && formatDate(selectedDate)}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Hora</span>
                  <span style={styles.summaryValue}>
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                  <span style={styles.summaryLabel}>Código</span>
                  <span style={{ ...styles.summaryValue, fontFamily: "monospace" }}>
                    {bookingId?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                style={{ ...styles.primaryButton(primaryColor), width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setFormData({ name: "", email: "", phone: "", notes: "" });
                  setBookingId(null);
                }}
              >
                Hacer otra reservación
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div style={styles.footer}>
            {step > 1 && (
              <button
                style={styles.secondaryButton}
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              >
                Atrás
              </button>
            )}
            {step === 1 && (
              <button
                style={styles.primaryButton(primaryColor)}
                onClick={() => setStep(2)}
                disabled={!selectedService}
              >
                Continuar
              </button>
            )}
            {step === 2 && (
              <button
                style={styles.primaryButton(primaryColor)}
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
              >
                Continuar
              </button>
            )}
            {step === 3 && (
              <button
                style={styles.primaryButton(primaryColor)}
                onClick={handleSubmit}
                disabled={submitting || !formData.name || !formData.email}
              >
                {submitting ? "Reservando..." : "Confirmar Reservación"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Powered by */}
      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        Powered by <strong style={{ color: "#6366f1" }}>Eventora</strong>
      </div>
    </div>
  );
}
