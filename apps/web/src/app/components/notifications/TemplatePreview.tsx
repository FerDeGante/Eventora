"use client";

interface TemplatePreviewProps {
  html: string;
  sampleData?: Record<string, string>;
}

const DEFAULT_SAMPLE_DATA: Record<string, string> = {
  "{{clientName}}": "María González",
  "{{clientEmail}}": "maria@example.com",
  "{{serviceName}}": "Masaje Relajante 60 min",
  "{{therapistName}}": "Dr. Juan Pérez",
  "{{appointmentDate}}": "15 de enero, 2026",
  "{{appointmentTime}}": "10:30 AM",
  "{{clinicName}}": "Wellness Center - Polanco",
  "{{clinicPhone}}": "+52 55 1234 5678",
  "{{confirmationLink}}": "https://eventora.com/confirm/abc123",
  "{{cancelLink}}": "https://eventora.com/cancel/abc123",
};

export function TemplatePreview({ html, sampleData = DEFAULT_SAMPLE_DATA }: TemplatePreviewProps) {
  // Replace variables with sample data
  let renderedHtml = html;
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    renderedHtml = renderedHtml.replace(regex, value);
  });

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Preview header */}
      <div
        style={{
          padding: "12px 16px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        Vista previa con datos de ejemplo
      </div>

      {/* Email preview container (simulates email client) */}
      <div style={{ padding: "24px" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Email header (simulated) */}
          <div
            style={{
              padding: "16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>De:</div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
              Eventora &lt;notifications@eventora.com&gt;
            </div>
          </div>

          {/* Email body */}
          <div
            style={{
              padding: "24px",
              background: "white",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#374151",
              }}
            />
          </div>

          {/* Email footer (simulated) */}
          <div
            style={{
              padding: "16px",
              background: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
              fontSize: "12px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>Este es un correo automático de Eventora</p>
            <p style={{ margin: 0 }}>
              © 2026 Eventora. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Sample data reference */}
      <div
        style={{
          padding: "16px",
          background: "#fffbeb",
          borderTop: "1px solid #fde68a",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#92400e", marginBottom: "8px" }}>
          Datos de ejemplo utilizados:
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "8px",
            fontSize: "11px",
            color: "#78350f",
          }}
        >
          {Object.entries(sampleData).map(([key, value]) => (
            <div key={key}>
              <code
                style={{
                  background: "#fef3c7",
                  padding: "2px 4px",
                  borderRadius: "2px",
                  fontWeight: "600",
                }}
              >
                {key}
              </code>
              {" → "}
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
