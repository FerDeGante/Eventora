"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useUxMetrics } from "@/app/hooks/useUxMetrics";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import styles from "./BookingWidget.module.css";

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
  const trackUx = useUxMetrics("booking_widget");
  const hasTrackedBookingStart = useRef(false);

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
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            `eventora-booking-meta:${data.id}`,
            JSON.stringify({
              clinicId: clinic.id,
              serviceId: selectedService.id,
              slotStartAt: selectedSlot.start,
              bookingStartedAt: new Date().toISOString(),
            }),
          );
        }
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

  const primaryColor = clinic?.primaryColor || "#6366f1";
  const containerStyle = {
    "--clinic-color": primaryColor,
    "--clinic-color-dark": adjustColor(primaryColor, -20),
  } as React.CSSProperties;

  // Loading state
  if (loading) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.loading}>Cargando...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !clinic) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.widget}>
          <div className={styles.errorContainer} role="alert">
            <div className={styles.errorTitle}>Error</div>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.widget}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.clinicName}>{clinic?.name || "Reservar Cita"}</h1>
          <p className={styles.headerSubtitle}>Agenda tu cita en línea</p>
        </div>

        {/* Steps */}
        <div className={styles.steps}>
          <div
            className={`${styles.step} ${step === 1 ? styles.stepActive : ""} ${step > 1 ? styles.stepCompleted : ""}`}
          >
            1. Servicio
          </div>
          <div
            className={`${styles.step} ${step === 2 ? styles.stepActive : ""} ${step > 2 ? styles.stepCompleted : ""}`}
          >
            2. Fecha y Hora
          </div>
          <div
            className={`${styles.step} ${step === 3 ? styles.stepActive : ""} ${step > 3 ? styles.stepCompleted : ""}`}
          >
            3. Datos
          </div>
          <div className={`${styles.step} ${step === 4 ? styles.stepActive : ""}`}>4. Confirmado</div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Step 1: Select Service */}
          {step === 1 && (
            <>
              <h2 className={styles.sectionTitle}>Selecciona un servicio</h2>
              <div className={styles.servicesList}>
                {services.length === 0 ? (
                  <p className={styles.emptyState}>No hay servicios disponibles</p>
                ) : (
                  services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className={`${styles.serviceCard} ${selectedService?.id === service.id ? styles.serviceCardSelected : ""}`}
                      onClick={() => {
                        setSelectedService(service);
                        if (!hasTrackedBookingStart.current && clinic) {
                          trackUx("action", {
                            event: "booking_started",
                            clinicId: clinic.id,
                            serviceId: service.id,
                            eventAt: new Date().toISOString(),
                          });
                          hasTrackedBookingStart.current = true;
                        }
                      }}
                    >
                      <div className={styles.serviceName}>{service.name}</div>
                      {service.description && (
                        <p className={styles.serviceDescription}>{service.description}</p>
                      )}
                      <div className={styles.serviceDetails}>
                        <span className={styles.serviceDuration}>
                          <ClockIcon /> {formatDuration(service.defaultDuration)}
                        </span>
                        <span className={styles.servicePrice}>
                          {formatPrice(service.basePrice)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <>
              <h2 className={styles.sectionTitle}>Selecciona fecha y hora</h2>

              {/* Calendar Navigation */}
              <div className={styles.calendarNav}>
                <button
                  type="button"
                  className={styles.calendarNavButton}
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                  }
                  aria-label="Mes anterior"
                >
                  <ChevronLeftIcon />
                </button>
                <span className={styles.calendarMonth}>
                  {currentMonth.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  className={styles.calendarNavButton}
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                  }
                  aria-label="Mes siguiente"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className={styles.calendarGrid}>
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div key={day} className={styles.calendarDay}>
                    {day}
                  </div>
                ))}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className={styles.calendarEmpty} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isPast = date < today;
                  const isToday = date.getTime() === today.getTime();
                  const isSelected = selectedDate?.getTime() === date.getTime();
                  const hasSlots = !isPast; // Simplified - in real app, check availability
                  const isDisabled = isPast || !hasSlots;

                  return (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.calendarDate} ${isSelected ? styles.calendarDateSelected : ""} ${isToday ? styles.calendarDateToday : ""} ${isDisabled ? styles.calendarDateDisabled : ""}`}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }
                      }}
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <>
                  <h3 className={styles.sectionTitleSub}>Horarios disponibles — {formatDate(selectedDate)}</h3>
                  {loadingSlots ? (
                    <p className={styles.emptyState}>Cargando horarios...</p>
                  ) : timeSlots.length === 0 ? (
                    <p className={styles.emptyState}>No hay horarios disponibles para esta fecha</p>
                  ) : (
                    <div className={styles.timeSlotsGrid}>
                      {timeSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`${styles.timeSlot} ${selectedSlot === slot ? styles.timeSlotSelected : ""}`}
                          onClick={() => {
                            if (!slot.available) return;
                            setSelectedSlot(slot);
                            if (clinic && selectedService) {
                              trackUx("action", {
                                event: "slot_selected",
                                clinicId: clinic.id,
                                serviceId: selectedService.id,
                                slotStartAt: slot.start,
                                slotEndAt: slot.end,
                                eventAt: new Date().toISOString(),
                              });
                            }
                          }}
                          disabled={!slot.available}
                          aria-pressed={selectedSlot === slot}
                        >
                          {formatTime(slot.start)}
                        </button>
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
              <h2 className={styles.sectionTitle}>Ingresa tus datos</h2>

              {/* Summary */}
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Servicio</span>
                  <span className={styles.summaryValue}>{selectedService?.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Fecha</span>
                  <span className={styles.summaryValue}>
                    {selectedDate && formatDate(selectedDate)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Hora</span>
                  <span className={styles.summaryValue}>
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Precio</span>
                  <span className={styles.summaryValueEmphasis}>
                    {selectedService && formatPrice(selectedService.basePrice)}
                  </span>
                </div>
              </div>

              {error && (
                <div className={styles.inlineError} role="alert">
                  {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="booking-name">
                  Nombre completo *
                </label>
                <input
                  id="booking-name"
                  type="text"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="booking-email">
                  Email *
                </label>
                <input
                  id="booking-email"
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="booking-phone">
                  Teléfono
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="booking-notes">
                  Notas adicionales
                </label>
                <textarea
                  id="booking-notes"
                  className={styles.textarea}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="¿Algo que debamos saber?"
                />
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className={styles.successContainer}>
              <div className={styles.successIcon} aria-hidden="true">
                <CheckIcon />
              </div>
              <h2 className={styles.successTitle}>¡Reservación Confirmada!</h2>
              <p className={styles.successMessage}>
                Te hemos enviado un email de confirmación a <strong>{formData.email}</strong>
              </p>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Servicio</span>
                  <span className={styles.summaryValue}>{selectedService?.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Fecha</span>
                  <span className={styles.summaryValue}>
                    {selectedDate && formatDate(selectedDate)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Hora</span>
                  <span className={styles.summaryValue}>
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Código</span>
                  <span className={styles.summaryValueMono}>
                    {bookingId?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <EventoraButton
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setFormData({ name: "", email: "", phone: "", notes: "" });
                  setBookingId(null);
                }}
                className={styles.fullWidthButton}
              >
                Hacer otra reservación
              </EventoraButton>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className={styles.footer}>
            {step > 1 && (
              <EventoraButton
                variant="ghost"
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className={styles.footerButton}
              >
                Atrás
              </EventoraButton>
            )}
            {step === 1 && (
              <EventoraButton
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className={styles.footerButton}
              >
                Continuar
              </EventoraButton>
            )}
            {step === 2 && (
              <EventoraButton
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                className={styles.footerButton}
              >
                Continuar
              </EventoraButton>
            )}
            {step === 3 && (
              <EventoraButton
                onClick={handleSubmit}
                disabled={submitting || !formData.name || !formData.email}
                className={styles.footerButton}
              >
                {submitting ? "Reservando..." : "Confirmar Reservación"}
              </EventoraButton>
            )}
          </div>
        )}
      </div>

      {/* Powered by */}
      <div className={styles.poweredBy}>
        Powered by <strong>Eventora</strong>
      </div>
    </div>
  );
}
