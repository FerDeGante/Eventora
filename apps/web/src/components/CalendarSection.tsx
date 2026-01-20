// src/components/CalendarSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Spinner, Button } from "react-bootstrap";
import RescheduleModal from "./admin/client/RescheduleModal";
import type { Reservation } from "@/types";

// Nuevo: props para rutas, textos y rol
interface CalendarSectionProps {
  apiBaseUrl: string; // ej. '/api/admin/reservations' o '/api/therapist/{id}/reservations'
  canEdit: boolean;   // ¿Muestra botón editar?
  title?: string;
}

export default function CalendarSection({
  apiBaseUrl,
  canEdit,
  title = "Reservaciones para",
}: CalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Traer días reservados al cambiar de mes
  useEffect(() => {
    const y = activeStartDate.getFullYear();
    const m = activeStartDate.getMonth();
    const first = new Date(y, m, 1).toISOString().slice(0, 10);
    const last = new Date(y, m + 1, 0).toISOString().slice(0, 10);

    fetch(`${apiBaseUrl}?start=${first}&end=${last}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{ date: string }[]>;
      })
      .then((data) => {
        const days = Array.from(new Set(data.map((r) => r.date.slice(0, 10))));
        setReservedDates(days);
      })
      .catch(() => setReservedDates([]));
  }, [activeStartDate, showModal, apiBaseUrl]);

  // Traer detalle al cambiar de día
  useEffect(() => {
    setLoading(true);
    setError("");
    setReservations([]);

    const Y = selectedDate.getFullYear();
    const Mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const D = String(selectedDate.getDate()).padStart(2, "0");
    const url = `${apiBaseUrl}?date=${Y}-${Mo}-${D}`;

    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
        return res.json() as Promise<Reservation[]>;
      })
      .then(setReservations)
      .catch((e: any) => setError(e.message || "Error cargando reservaciones."))
      .finally(() => setLoading(false));
  }, [selectedDate, showModal, apiBaseUrl]);

  const handleOpenModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedReservation(null);
    setShowModal(false);
  };
  const handleRescheduleSuccess = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  return (
    <div className="d-flex">
      <div className="me-4">
        <Calendar
          value={selectedDate}
          onChange={(d) => {
            const dt = Array.isArray(d) ? d[0] : d;
            if (dt instanceof Date && !isNaN(dt.getTime())) setSelectedDate(dt);
          }}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate instanceof Date) setActiveStartDate(activeStartDate);
          }}
          tileClassName={({ date, view }) =>
            view === "month" && reservedDates.includes(date.toISOString().slice(0, 10))
              ? "has-reservation"
              : undefined
          }
        />
      </div>
      <div className="flex-grow-1">
        <h3 className="mb-3 text-primary">
          {title} {selectedDate.toLocaleDateString("es-ES")}
        </h3>

        {loading ? (
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Cargando reservaciones…</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="alert alert-info">
            No hay reservaciones registradas para este día.
          </div>
        ) : (
          <div className="mt-3">
            {reservations.map((r) => {
              const hora = new Date(r.date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={r.id} className="p-3 mb-2 border rounded d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold">{hora}</span>
                    <span className="ms-2">{r.userName}</span>
                    <div className="text-secondary">
                      {r.serviceName} {r.therapistName ? `— ${r.therapistName}` : ""}
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        {`Sesión ${r.sessionNumber}/${r.totalSessions}`}
                      </small>
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleOpenModal(r)}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedReservation && (
        <RescheduleModal
          show={showModal}
          onHide={handleCloseModal}
          reservation={selectedReservation}
          onRescheduleSuccess={handleRescheduleSuccess}
          adminMode={canEdit}
        />
      )}
    </div>
  );
}