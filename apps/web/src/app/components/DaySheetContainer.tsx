"use client";

import { useState, useMemo } from "react";
import { DaySheetFilters, type DaySheetFilterValues } from "./DaySheetFilters";
import { DaySheetActions } from "./DaySheetActions";
import { updateReservationStatus } from "@/lib/admin-api";

interface TimelineEvent {
  id: string;
  time?: string;
  patient: string;
  service: string;
  therapist?: string;
  branch?: string;
  status: string;
}

interface DaySheetContainerProps {
  initialTimeline: TimelineEvent[];
  isFallback: boolean;
}

export function DaySheetContainer({ initialTimeline, isFallback }: DaySheetContainerProps) {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [filters, setFilters] = useState<DaySheetFilterValues>({
    branch: "all",
    therapist: "all",
    status: "all",
    date: new Date().toISOString().split("T")[0],
  });

  // Extract unique branches and therapists from timeline
  const branches = useMemo(() => Array.from(new Set(timeline.map((event) => event.branch).filter((b): b is string => !!b))), [timeline]);
  const therapists = useMemo(() => Array.from(new Set(timeline.map((event) => event.therapist).filter((t): t is string => !!t))), [timeline]);

  // Filter timeline based on selected filters
  const filteredTimeline = useMemo(() => {
    return timeline.filter((event) => {
      if (filters.branch !== "all" && event.branch !== filters.branch) return false;
      if (filters.therapist !== "all" && event.therapist !== filters.therapist) return false;
      if (filters.status !== "all" && event.status !== filters.status) return false;
      return true;
    });
  }, [timeline, filters]);

  // Calculate KPIs for the day
  const dayKpis = useMemo(() => {
    const total = filteredTimeline.length;
    const checkedIn = filteredTimeline.filter((e) => e.status === "checked_in").length;
    const completed = filteredTimeline.filter((e) => e.status === "completed").length;
    const noShow = filteredTimeline.filter((e) => e.status === "no_show").length;
    const scheduled = filteredTimeline.filter((e) => e.status === "scheduled").length;
    
    return {
      total,
      checkedIn,
      completed,
      noShow,
      scheduled,
      occupancy: total > 0 ? Math.round(((checkedIn + completed) / total) * 100) : 0,
    };
  }, [filteredTimeline]);

  const handleCheckIn = async (id: string) => {
    try {
      await updateReservationStatus(id, "checked_in");
      setTimeline((prev) => prev.map((event) => (event.id === id ? { ...event, status: "checked_in" } : event)));
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Error al hacer check-in. Por favor intenta de nuevo.");
    }
  };

  const handleMarkNoShow = async (id: string) => {
    try {
      await updateReservationStatus(id, "no_show");
      setTimeline((prev) => prev.map((event) => (event.id === id ? { ...event, status: "no_show" } : event)));
    } catch (error) {
      console.error("Error marking no show:", error);
      alert("Error al marcar no show. Por favor intenta de nuevo.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateReservationStatus(id, "completed");
      setTimeline((prev) => prev.map((event) => (event.id === id ? { ...event, status: "completed" } : event)));
    } catch (error) {
      console.error("Error completing reservation:", error);
      alert("Error al completar reserva. Por favor intenta de nuevo.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;
    try {
      await updateReservationStatus(id, "cancelled");
      setTimeline((prev) => prev.map((event) => (event.id === id ? { ...event, status: "cancelled" } : event)));
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Error al cancelar reserva. Por favor intenta de nuevo.");
    }
  };

  return (
    <div>
      {/* Day KPIs */}
      <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginBottom: "0.75rem" }}>KPIs del día</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.total}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Total reservas</p>
          </div>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.scheduled}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Programadas</p>
          </div>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.checkedIn}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Check-in</p>
          </div>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.completed}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Completadas</p>
          </div>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.noShow}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>No show</p>
          </div>
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{dayKpis.occupancy}%</p>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Ocupación</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DaySheetFilters branches={branches} therapists={therapists} onFilterChange={setFilters} />

      {/* Timeline */}
      <div className="dashboard-stream glass-panel">
        <div className="dashboard-stream__header">
          <p>Timeline de hoy ({filteredTimeline.length} reservas)</p>
          <span>{isFallback ? "Mostrando datos locales" : "Room view holográfico"}</span>
        </div>
        <ul className="dashboard-timeline">
          {filteredTimeline.map((event) => (
            <li key={event.id} className={`dashboard-timeline__item is-${event.status}`}>
              <div>
                <p className="dashboard-timeline__time">{event.time}</p>
                <p className="dashboard-timeline__patient">{event.patient}</p>
              </div>
              <div>
                <p className="dashboard-timeline__service">{event.service}</p>
                <p className="dashboard-timeline__meta">
                  {event.branch} · {event.therapist}
                </p>
              </div>
              <div className="dashboard-timeline__status">
                <DaySheetActions
                  reservationId={event.id}
                  status={event.status}
                  onCheckIn={handleCheckIn}
                  onMarkNoShow={handleMarkNoShow}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
