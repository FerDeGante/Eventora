"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  isSameDay,
  parseISO,
  setHours,
  addDays,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import { getReservations, getTherapists, updateReservationStatus, createReservation, getServices, getBranches, type Reservation } from "@/lib/admin-api";
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

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", label: "Pendiente" },
  CONFIRMED: { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", label: "Confirmada" },
  COMPLETED: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", label: "Completada" },
  CANCELLED: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", label: "Cancelada" },
  NO_SHOW: { color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)", label: "No asistió" },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 9pm

type ViewMode = "week" | "month" | "day";

type NewReservationSlot = {
  date: Date;
  hour: number;
};

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const trackUx = useUxMetrics("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTherapist, setSelectedTherapist] = useState<string>("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [newReservationSlot, setNewReservationSlot] = useState<NewReservationSlot | null>(null);

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    } else if (viewMode === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    } else {
      return { start: currentDate, end: currentDate };
    }
  }, [currentDate, viewMode]);

  const days = useMemo(() => {
    if (viewMode === "day") return [currentDate];
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange, viewMode, currentDate]);

  // Fetch data
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["reservations", format(dateRange.start, "yyyy-MM-dd"), format(dateRange.end, "yyyy-MM-dd"), selectedTherapist],
    queryFn: () => getReservations({
      startDate: format(dateRange.start, "yyyy-MM-dd"),
      endDate: format(dateRange.end, "yyyy-MM-dd"),
      therapistId: selectedTherapist || undefined,
    }),
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ["therapists"],
    queryFn: getTherapists,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string; serviceId?: string }) =>
      updateReservationStatus(id, status),
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

  // Navigation
  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else if (viewMode === "month") {
      setCurrentDate(direction === "next" ? addDays(currentDate, 30) : addDays(currentDate, -30));
    } else {
      setCurrentDate(direction === "next" ? addDays(currentDate, 1) : addDays(currentDate, -1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get reservations for a specific day and hour
  const getReservationsForSlot = (day: Date, hour: number) => {
    return reservations.filter((res) => {
      const start = parseISO(res.startAt);
      return isSameDay(start, day) && start.getHours() === hour;
    });
  };

  const handleStatusChange = (status: string) => {
    if (selectedReservation) {
      statusMutation.mutate({ id: selectedReservation.id, status, serviceId: selectedReservation.service?.id });
    }
  };

  return (
    <div className="cal">
      {/* Header */}
      <header className="cal-header">
        <div className="cal-header__left">
          <h1 className="cal-title">
            {viewMode === "month" 
              ? format(currentDate, "MMMM yyyy", { locale: es })
              : viewMode === "day"
              ? format(currentDate, "EEEE, d MMMM", { locale: es })
              : `${format(dateRange.start, "d MMM", { locale: es })} — ${format(dateRange.end, "d MMM yyyy", { locale: es })}`
            }
          </h1>
          <div className="cal-nav">
            <button className="cal-nav__btn" onClick={() => navigate("prev")}>
              <ChevronLeft size={20} />
            </button>
            <button className="cal-nav__today" onClick={goToToday}>Hoy</button>
            <button className="cal-nav__btn" onClick={() => navigate("next")}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="cal-header__right">
          <select
            value={selectedTherapist}
            onChange={(e) => setSelectedTherapist(e.target.value)}
            className="cal-filter"
          >
            <option value="">Todos los terapeutas</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <div className="cal-view-toggle">
            <button 
              className={`cal-view-btn ${viewMode === "day" ? "active" : ""}`}
              onClick={() => setViewMode("day")}
              title="Vista día"
            >
              <List size={16} />
            </button>
            <button 
              className={`cal-view-btn ${viewMode === "week" ? "active" : ""}`}
              onClick={() => setViewMode("week")}
              title="Vista semana"
            >
              <Grid size={16} />
            </button>
            <button 
              className={`cal-view-btn ${viewMode === "month" ? "active" : ""}`}
              onClick={() => setViewMode("month")}
              title="Vista mes"
            >
              <CalendarIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="cal-loading">
          <div className="cal-loading__spinner" />
          <p>Cargando reservaciones...</p>
        </div>
      ) : viewMode === "month" ? (
        <MonthView 
          currentDate={currentDate}
          reservations={reservations}
          onSelectReservation={setSelectedReservation}
          onSelectDay={(day) => { setCurrentDate(day); setViewMode("day"); }}
        />
      ) : (
        <div className="cal-grid">
          {/* Time column */}
          <div className="cal-times">
            <div className="cal-times__header" />
            {HOURS.map((hour) => (
              <div key={hour} className="cal-times__slot">
                {format(setHours(new Date(), hour), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => (
            <div key={day.toISOString()} className="cal-day">
              <div className={`cal-day__header ${isSameDay(day, new Date()) ? "is-today" : ""}`}>
                <span className="cal-day__name">{format(day, "EEE", { locale: es })}</span>
                <span className="cal-day__number">{format(day, "d")}</span>
              </div>
              <div className="cal-day__slots">
                {HOURS.map((hour) => {
                  const slotReservations = getReservationsForSlot(day, hour);
                  return (
                    <div 
                      key={hour} 
                      className="cal-slot"
                      onClick={() => {
                        if (slotReservations.length === 0) {
                          setNewReservationSlot({ date: day, hour });
                        }
                      }}
                      style={{ cursor: slotReservations.length === 0 ? "pointer" : "default" }}
                    >
                      {slotReservations.map((res) => (
                        <button
                          key={res.id}
                          className="cal-event"
                          style={{ 
                            borderLeftColor: statusConfig[res.status]?.color,
                            backgroundColor: statusConfig[res.status]?.bg,
                          }}
                          onClick={() => setSelectedReservation(res)}
                        >
                          <span className="cal-event__time">
                            {format(parseISO(res.startAt), "HH:mm")}
                          </span>
                          <span className="cal-event__title">
                            {res.user?.name || "Cliente"}
                          </span>
                          <span className="cal-event__service">
                            {res.service?.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="cal-legend">
        {Object.entries(statusConfig).map(([key, config]) => (
          <span key={key} className="cal-legend__item">
            <span className="cal-legend__dot" style={{ backgroundColor: config.color }} />
            {config.label}
          </span>
        ))}
      </div>

      {/* Reservation Modal */}
      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onStatusChange={handleStatusChange}
          isUpdating={statusMutation.isPending}
        />
      )}

      {/* New Reservation Modal */}
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

        /* Grid */
        .cal-grid {
          display: flex;
          background: var(--surface-base);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          overflow: hidden;
          flex: 1;
          min-height: 600px;
        }

        .cal-times {
          flex-shrink: 0;
          width: 64px;
          border-right: 1px solid var(--border-subtle);
        }

        .cal-times__header {
          height: 64px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .cal-times__slot {
          height: 60px;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 0.25rem 0.75rem 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: lowercase;
        }

        .cal-day {
          flex: 1;
          min-width: 0;
          border-right: 1px solid var(--border-subtle);
        }

        .cal-day:last-child {
          border-right: none;
        }

        .cal-day__header {
          height: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--border-subtle);
          gap: 0.25rem;
        }

        .cal-day__header.is-today .cal-day__number {
          background: var(--accent-primary);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cal-day__name {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .cal-day__number {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cal-day__slots {
          position: relative;
        }

        .cal-slot {
          height: 60px;
          border-bottom: 1px solid var(--border-subtle);
          padding: 2px;
          overflow: hidden;
        }

        .cal-slot:last-child {
          border-bottom: none;
        }

        .cal-event {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.375rem 0.5rem;
          border-radius: 0.375rem;
          border: none;
          border-left: 3px solid;
          text-align: left;
          cursor: pointer;
          width: 100%;
          height: 100%;
          transition: all 0.2s;
          overflow: hidden;
        }

        .cal-event:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .cal-event__time {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cal-event__title {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cal-event__service {
          font-size: 0.7rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Loading */
        .cal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 1rem;
          color: var(--text-muted);
        }

        .cal-loading__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-subtle);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Legend */
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

        @media (max-width: 768px) {
          .cal-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .cal-grid {
            overflow-x: auto;
          }

          .cal-day {
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}

// Month View Component
function MonthView({ 
  currentDate, 
  reservations, 
  onSelectReservation,
  onSelectDay,
}: { 
  currentDate: Date;
  reservations: Reservation[];
  onSelectReservation: (r: Reservation) => void;
  onSelectDay: (day: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => isSameDay(parseISO(res.startAt), day));
  };

  return (
    <div className="month-grid">
      <div className="month-header">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="month-header__cell">{day}</div>
        ))}
      </div>
      {weeks.map((weekStart) => {
        const weekDays = eachDayOfInterval({ 
          start: weekStart, 
          end: addDays(weekStart, 6) 
        });
        return (
          <div key={weekStart.toISOString()} className="month-row">
            {weekDays.map((day) => {
              const dayReservations = getReservationsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  className={`month-cell ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "is-today" : ""}`}
                  onClick={() => onSelectDay(day)}
                >
                  <span className="month-cell__number">{format(day, "d")}</span>
                  {dayReservations.length > 0 && (
                    <div className="month-cell__events">
                      {dayReservations.slice(0, 3).map((res) => (
                        <div
                          key={res.id}
                          className="month-event"
                          style={{ backgroundColor: statusConfig[res.status]?.color }}
                          onClick={(e) => { e.stopPropagation(); onSelectReservation(res); }}
                        />
                      ))}
                      {dayReservations.length > 3 && (
                        <span className="month-cell__more">+{dayReservations.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}

      <style jsx>{`
        .month-grid {
          background: var(--surface-base);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          overflow: hidden;
        }

        .month-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--border-subtle);
        }

        .month-header__cell {
          padding: 1rem;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .month-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .month-row:not(:last-child) {
          border-bottom: 1px solid var(--border-subtle);
        }

        .month-cell {
          min-height: 100px;
          padding: 0.5rem;
          border: none;
          border-right: 1px solid var(--border-subtle);
          background: var(--surface-base);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .month-cell:last-child {
          border-right: none;
        }

        .month-cell:hover {
          background: var(--surface-elevated);
        }

        .month-cell.other-month {
          background: var(--surface-elevated);
          opacity: 0.5;
        }

        .month-cell__number {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .month-cell.is-today .month-cell__number {
          background: var(--accent-primary);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .month-cell__events {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .month-event {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .month-event:hover {
          transform: scale(1.3);
        }

        .month-cell__more {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

// New Reservation Modal
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
          <p className="modal-date">
            {format(startAt, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Servicio *</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sucursal *</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              required
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Terapeuta</label>
            <select
              value={formData.therapistId}
              onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}
            >
              <option value="">Sin asignar</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
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

// Reservation Modal
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
                <p className="info-value">
                  {format(parseISO(reservation.startAt), "EEEE, d 'de' MMMM", { locale: es })}
                </p>
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
