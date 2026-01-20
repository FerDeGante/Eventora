"use client";

import { useState } from "react";
import { EventoraButton } from "./ui/EventoraButton";

interface DaySheetFiltersProps {
  branches: string[];
  therapists: string[];
  onFilterChange: (filters: DaySheetFilterValues) => void;
}

export interface DaySheetFilterValues {
  branch: string;
  therapist: string;
  status: string;
  date: string;
}

export function DaySheetFilters({ branches, therapists, onFilterChange }: DaySheetFiltersProps) {
  const [filters, setFilters] = useState<DaySheetFilterValues>({
    branch: "all",
    therapist: "all",
    status: "all",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (key: keyof DaySheetFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: DaySheetFilterValues = {
      branch: "all",
      therapist: "all",
      status: "all",
      date: new Date().toISOString().split("T")[0],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div>
          <label htmlFor="date" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={filters.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="eventora-input"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label htmlFor="branch" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Sucursal
          </label>
          <select
            id="branch"
            value={filters.branch}
            onChange={(e) => handleChange("branch", e.target.value)}
            className="eventora-input"
            style={{ width: "100%" }}
          >
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="therapist" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Terapeuta
          </label>
          <select
            id="therapist"
            value={filters.therapist}
            onChange={(e) => handleChange("therapist", e.target.value)}
            className="eventora-input"
            style={{ width: "100%" }}
          >
            <option value="all">Todos los terapeutas</option>
            {therapists.map((therapist) => (
              <option key={therapist} value={therapist}>
                {therapist}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Estado
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="eventora-input"
            style={{ width: "100%" }}
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programadas</option>
            <option value="checked_in">Check-in</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">No show</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <EventoraButton variant="ghost" onClick={resetFilters}>
          Resetear filtros
        </EventoraButton>
      </div>
    </div>
  );
}
