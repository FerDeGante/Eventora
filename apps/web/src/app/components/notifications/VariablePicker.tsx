"use client";

import { useState } from "react";
import { ChevronDown } from "react-feather";

interface Variable {
  key: string;
  label: string;
  description: string;
  example: string;
}

const AVAILABLE_VARIABLES: Variable[] = [
  {
    key: "{{clientName}}",
    label: "Nombre del cliente",
    description: "Nombre completo del cliente",
    example: "María González",
  },
  {
    key: "{{clientEmail}}",
    label: "Email del cliente",
    description: "Dirección de correo electrónico",
    example: "maria@example.com",
  },
  {
    key: "{{serviceName}}",
    label: "Nombre del servicio",
    description: "Servicio reservado",
    example: "Masaje Relajante",
  },
  {
    key: "{{therapistName}}",
    label: "Nombre del terapeuta",
    description: "Profesional asignado",
    example: "Dr. Juan Pérez",
  },
  {
    key: "{{appointmentDate}}",
    label: "Fecha de la cita",
    description: "Fecha formateada de la cita",
    example: "15 de enero, 2026",
  },
  {
    key: "{{appointmentTime}}",
    label: "Hora de la cita",
    description: "Hora formateada de la cita",
    example: "10:30 AM",
  },
  {
    key: "{{clinicName}}",
    label: "Nombre de la clínica",
    description: "Clínica donde se realizará el servicio",
    example: "Wellness Center",
  },
  {
    key: "{{clinicPhone}}",
    label: "Teléfono de la clínica",
    description: "Número de contacto de la clínica",
    example: "+52 55 1234 5678",
  },
  {
    key: "{{confirmationLink}}",
    label: "Link de confirmación",
    description: "URL para confirmar/cancelar la cita",
    example: "https://eventora.com/confirm/abc123",
  },
  {
    key: "{{cancelLink}}",
    label: "Link de cancelación",
    description: "URL para cancelar la reserva",
    example: "https://eventora.com/cancel/abc123",
  },
];

interface VariablePickerProps {
  onInsert: (variable: string) => void;
}

export function VariablePicker({ onInsert }: VariablePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredVariables = AVAILABLE_VARIABLES.filter(
    (v) =>
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (variable: Variable) => {
    onInsert(variable.key);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Insertar variable
        <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              width: "400px",
              maxWidth: "90vw",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              zIndex: 999,
              maxHeight: "400px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search */}
            <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
              <input
                type="text"
                placeholder="Buscar variable..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Variables list */}
            <div style={{ overflowY: "auto", maxHeight: "300px" }}>
              {filteredVariables.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
                  No se encontraron variables
                </div>
              ) : (
                filteredVariables.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    onClick={() => handleInsert(variable)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#7c3aed",
                            background: "#f5f3ff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {variable.key}
                        </code>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                          {variable.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        {variable.description}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                        Ejemplo: {variable.example}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
