"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import type FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core/index.css";
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import {
  getReservations,
  getTherapists,
  updateReservationStatus,
  createReservation,
  getServices,
  getBranches,
  type Reservation,
} from "@/lib/admin-api";
import { useAuth } from "@/app/hooks/useAuth";
import { useUxMetrics } from "@/app/hooks/useUxMetrics";
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Grid,
  List,
} from "react-feather";
import CalendarView, { type CalendarRangeInfo, type CalendarViewMode } from "./CalendarView";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", label: "Pendiente" },
  CONFIRMED: { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", label: "Confirmada" },
  COMPLETED: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", label: "Completada" },
  CANCELLED: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", label: "Cancelada" },
  NO_SHOW: { color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)", label: "No asistió" },
};

type NewReservationSlot = {
  date: Date;
  hour: number;
};

const viewIcons: Record<CalendarViewMode, JSX.Element> = {
  timeGridDay: <List size={16} />,
  timeGridWeek: <Grid size={16} />,
  dayGridMonth: <CalendarIcon size={16} />,
};

const viewLabels: Record<CalendarViewMode, string> = {
  timeGridDay: "Vista día",
  timeGridWeek: "Vista semana",
  dayGridMonth: "Vista mes",
};

const calendarViews: CalendarViewMode[] = ["timeGridDay", "timeGridWeek", "dayGridMonth"];

const clampHour = (hour: number) => {
  if (!Number.isFinite(hour)) return 9;
  if (hour < 7) return 7;
  if (hour > 21) return 21;
  return hour;
};

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const trackUx = useUxMetrics("calendar");
  const calendarRef = useRef<FullCalendar | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("timeGridWeek");
  const [selectedTherapist, setSelectedTherapist] = useState<string>("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [newReservationSlot, setNewReservationSlot] = useState<NewReservationSlot | null>(null);
  const [calendarTitle, setCalendarTitle] = useState<string>(format(new Date(), "MMMM yyyy", { locale: es }));
  const [calendarRange, setCalendarRange] = useState(() => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    };
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: [
      "reservations",
      format(calendarRange.start, "yyyy-MM-dd"),
      format(calendarRange.end, "yyyy-MM-dd"),
      selectedTherapist,
    ],
    queryFn: () =>
      getReservations({
        startDate: format(calendarRange.start, "yyyy-MM-dd"),
        endDate: format(calendarRange.end, "yyyy-MM-dd"),
        therapistId: selectedTherapist || undefined,
      }),
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ["therapists"],
    queryFn: getTherapists,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string; serviceId?: string }) => updateReservationStatus(id, status),
    onSuccess: (_data, variables) => {
      if (variables.status === "COMPLETED" || variables.status === "NO_SHOW") {
        trackUx("action", {
          event: variables.status === "COMPLETED" ? "checkin_completed" : "no_show_marked",
          reservationId: variables.id,
          clinicId: auth.user?.clinicId,
          serviceId: variables.serviceId,
          eventAt: new Date().toISOString(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setSelectedReservation(null);
    },
  });

  const handleCalendarNavigation = (direction: "prev" | "next") => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (direction === "prev") {
      api.prev();
    } else {
      api.next();
    }
  };

  const handleCalendarToday = () => {
    calendarRef.current?.getApi()?.today();
  };

  const handleViewChange = (mode: CalendarViewMode) => {
    calendarRef.current?.getApi()?.changeView(mode);
  };

  const handleDatesChange = (info: CalendarRangeInfo) => {
    setCalendarTitle(info.title);
    setCalendarRange({ start: info.start, end: info.end });
    setViewMode(info.viewType);
  };

  const handleStatusChange = (status: string) => {
    if (selectedReservation) {
      statusMutation.mutate({ id: selectedReservation.id, status, serviceId: selectedReservation.service?.id });
    }
  };

  const handleEmptyCta = () => {
    const now = new Date();
    const nextHour = clampHour(now.getHours() + 1);
    setNewReservationSlot({ date: now, hour: nextHour });
  };

  const isEmptyState = useMemo(() => !isLoading && reservations.length === 0, [isLoading, reservations.length]);

  return (
    <div className="cal">
      <header className="cal-header">
        <div className="cal-header__left">
          <h1 className="cal-title">{calendarTitle}</h1>
          <div className="cal-nav">
            <button className="cal-nav__btn" onClick={() => handleCalendarNavigation("prev")}> 
              <ChevronLeft size={20} />
            </button>
            <button className="cal-nav__today" onClick={handleCalendarToday}>Hoy</button>
            <button className="cal-nav__btn" onClick={() => handleCalendarNavigation("next")}> 
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="cal-header__right">
          <select value={selectedTherapist} onChange={(e) => setSelectedTherapist(e.target.value)} className="cal-filter">
            <option value="">Todos los terapeutas</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="cal-view-toggle">
            {calendarViews.map((mode) => (
              <button
                key={mode}
                className={`cal-view-btn ${viewMode === mode ? "active" : ""}`}
                onClick={() => handleViewChange(mode)}
                title={viewLabels[mode]}
              >
                {viewIcons[mode]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="cal-body">
        <CalendarView
          ref={calendarRef}
          reservations={reservations}
          statusConfig={statusConfig}
          onSelectReservation={setSelectedReservation}
          onSelectSlot={(slot) =>
            setNewReservationSlot({
              date: slot.date,
              hour: clampHour(slot.hour),
            })
          }
          onDatesChange={handleDatesChange}
        />

        {isLoading && (
          <div className="cal-loading" role="status" aria-live="polite">
            <div className="cal-loading__spinner" />
            <p>Cargando reservaciones...</p>
          </div>
        )}

        {isEmptyState && (
          <div className="cal-empty">
            <div className="cal-empty__content">
              <h2>Agenda limpia</h2>
              <p>Este rango todavía no tiene reservaciones. Agenda la primera cita para activar la semana.</p>
              <EventoraButton onClick={handleEmptyCta}>Crear reservación</EventoraButton>
            </div>
          </div>
        )}
      </div>

      <div className="cal-legend">
        {Object.entries(statusConfig).map(([key, config]) => (
          <span key={key} className="cal-legend__item">
            <span className="cal-legend__dot" style={{ backgroundColor: config.color }} />
            {config.label}
          </span>
        ))}
      </div>

      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onStatusChange={handleStatusChange}
          isUpdating={statusMutation.isPending}
        />
      )}

      {newReservationSlot && (
        <NewReservationModal
          slot={newReservationSlot}
          therapists={therapists}
          selectedTherapist={selectedTherapist}
          onClose={() => setNewReservationSlot(null)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            setNewReservationSlot(null);
          }}
        />
      )}

      <style jsx>{`
        .cal {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .cal-header__left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .cal-header__right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .cal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: capitalize;
          margin: 0;
        }

        .cal-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cal-nav__btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: var(--surface-base);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .cal-nav__btn:hover {
          background: var(--surface-elevated);
          color: var(--text-primary);
        }

        .cal-nav__today {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          border: 1px solid var(--border-subtle);
          background: var(--surface-base);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cal-nav__today:hover {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .cal-filter {
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-subtle);
          background: var(--surface-base);
          color: var(--text-primary);
          font-size: 0.875rem;
          min-width: 180px;
        }

        .cal-view-toggle {
          display: flex;
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .cal-view-btn {
          padding: 0.625rem 0.875rem;
          border: none;
          background: var(--surface-base);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .cal-view-btn:not(:last-child) {
          border-right: 1px solid var(--border-subtle);
        }

        .cal-view-btn.active,
        .cal-view-btn:hover {
          background: var(--accent-primary);
          color: white;
        }

        .cal-body {
          position: relative;
          background: var(--surface-base);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          overflow: hidden;
          min-height: 620px;
        }

        .cal-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: rgba(2, 6, 23, 0.6);
          color: var(--text-muted);
          backdrop-filter: blur(6px);
          z-index: 2;
        }

        .cal-loading__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-subtle);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .cal-empty {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 1;
          pointer-events: none;
        }

        .cal-empty__content {
          max-width: 360px;
          text-align: center;
          background: rgba(2, 6, 23, 0.7);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: auto;
        }

        .cal-empty__content h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .cal-empty__content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .cal-legend {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cal-legend__item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .cal-legend__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .cal-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

function NewReservationModal({
  slot,
  therapists,
  selectedTherapist,
  onClose,
  onCreated,
}: {
  slot: { date: Date; hour: number };
  therapists: { id: string; name: string }[];
  selectedTherapist: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceId: "",
    therapistId: selectedTherapist,
    branchId: "",
    notes: "",
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services-calendar"],
    queryFn: getServices,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-calendar"],
    queryFn: getBranches,
  });

  const startAt = useMemo(() => {
    const d = new Date(slot.date);
    d.setHours(slot.hour, 0, 0, 0);
    return d;
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.branchId || !formData.clientName || !formData.clientEmail) {
      setError("Por favor completa los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReservation({
        serviceId: formData.serviceId,
        branchId: formData.branchId,
        therapistId: formData.therapistId || undefined,
        startAt: startAt.toISOString(),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        notes: formData.notes || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Error al crear la reservación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>Nueva Reservación</h2>
          <p className="modal-date">{format(startAt, "EEEE d 'de' MMMM, HH:mm", { locale: es })}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Servicio *</label>
            <select value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} required>
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sucursal *</label>
            <select value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} required>
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Terapeuta</label>
            <select value={formData.therapistId} onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}>
              <option value="">Sin asignar</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-divider" />

          <div className="form-group">
            <label>Nombre del cliente *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="juan@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+52 555 123 4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <EventoraButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Reservación"}
            </EventoraButton>
          </div>
        </form>

        <style jsx>{`
          .modal-form {
            max-width: 520px;
          }
          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
          }
          .modal-header h2 {
            margin: 0 0 0.25rem;
            font-size: 1.25rem;
          }
          .modal-date {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin: 0;
            text-transform: capitalize;
          }
          .modal-form-content {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .form-error {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
          }
          .form-group label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
          }
          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 0.625rem 0.75rem;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            background: var(--bg-secondary);
            color: var(--text-primary);
          }
          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .form-divider {
            height: 1px;
            background: var(--border);
            margin: 0.5rem 0;
          }
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }
          .btn-cancel {
            padding: 0.625rem 1rem;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 0.875rem;
          }
          .btn-cancel:hover {
            background: var(--bg-secondary);
          }
        `}</style>
      </div>
    </div>
  );
}

function ReservationModal({
  reservation,
  onClose,
  onStatusChange,
  isUpdating,
}: {
  reservation: Reservation;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}) {
  const config = statusConfig[reservation.status];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-status" style={{ backgroundColor: config?.bg }}>
          <span style={{ color: config?.color }}>{config?.label}</span>
        </div>

        <div className="modal-content">
          <h2>{reservation.service?.name || "Servicio"}</h2>

          <div className="modal-info">
            <div className="info-row">
              <User size={18} />
              <div>
                <p className="info-label">Cliente</p>
                <p className="info-value">{reservation.user?.name}</p>
                <p className="info-sub">{reservation.user?.email}</p>
              </div>
            </div>

            <div className="info-row">
              <Clock size={18} />
              <div>
                <p className="info-label">Fecha y hora</p>
                <p className="info-value">{format(parseISO(reservation.startAt), "EEEE, d 'de' MMMM", { locale: es })}</p>
                <p className="info-sub">
                  {format(parseISO(reservation.startAt), "HH:mm")} — {format(parseISO(reservation.endAt), "HH:mm")}
                </p>
              </div>
            </div>

            {reservation.therapist && (
              <div className="info-row">
                <User size={18} />
                <div>
                  <p className="info-label">Terapeuta</p>
                  <p className="info-value">{reservation.therapist.name}</p>
                </div>
              </div>
            )}

            {reservation.branch && (
              <div className="info-row">
                <MapPin size={18} />
                <div>
                  <p className="info-label">Sucursal</p>
                  <p className="info-value">{reservation.branch.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-price">
            <span>Total</span>
            <span>${((reservation.service?.price || 0) / 100).toFixed(0)} MXN</span>
          </div>
        </div>

        <div className="modal-actions">
          {reservation.status === "PENDING" && (
            <EventoraButton onClick={() => onStatusChange("CONFIRMED")} disabled={isUpdating}>
              <CheckCircle size={16} /> Confirmar cita
            </EventoraButton>
          )}
          {reservation.status === "CONFIRMED" && (
            <>
              <EventoraButton onClick={() => onStatusChange("COMPLETED")} disabled={isUpdating} className="checkin-btn">
                <CheckCircle size={16} /> Check-in completado
              </EventoraButton>
              <EventoraButton variant="ghost" onClick={() => onStatusChange("NO_SHOW")} disabled={isUpdating}>
                No asistió
              </EventoraButton>
            </>
          )}
          {["PENDING", "CONFIRMED"].includes(reservation.status) && (
            <EventoraButton variant="ghost" onClick={() => onStatusChange("CANCELLED")} disabled={isUpdating}>
              <XCircle size={16} /> Cancelar
            </EventoraButton>
          )}
        </div>

        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal {
            background: var(--surface-base);
            border-radius: 1.5rem;
            width: 100%;
            max-width: 420px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--surface-base);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-muted);
            z-index: 1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .modal-close:hover {
            color: var(--text-primary);
          }

          .modal-status {
            padding: 1.5rem 2rem;
          }

          .modal-status span {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .modal-content {
            padding: 1.5rem 2rem;
          }

          .modal-content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 1.5rem;
            color: var(--text-primary);
          }

          .modal-info {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .info-row {
            display: flex;
            gap: 1rem;
            color: var(--text-muted);
          }

          .info-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .info-value {
            font-size: 1rem;
            color: var(--text-primary);
            font-weight: 500;
            margin: 0.25rem 0 0;
          }

          .info-sub {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0.125rem 0 0;
          }

          .modal-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-subtle);
          }

          .modal-price span:first-child {
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          .modal-price span:last-child {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .modal-actions {
            display: flex;
            gap: 0.75rem;
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border-subtle);
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    </div>
  );
}
