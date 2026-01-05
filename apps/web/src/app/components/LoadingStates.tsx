export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "20px",
    md: "40px",
    lg: "60px",
  };

  return (
    <div className="loading-spinner" style={{
      width: sizes[size],
      height: sizes[size],
      border: "3px solid rgba(var(--color-primary-rgb), 0.1)",
      borderTop: "3px solid var(--color-primary)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}

export function LoadingCard() {
  return (
    <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
      <LoadingSpinner size="lg" />
      <p style={{ marginTop: "1.5rem", color: "var(--color-text-secondary)" }}>
        Cargando...
      </p>
    </div>
  );
}

export function LoadingOverlay({ message = "Cargando..." }: { message?: string }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div className="glass-panel" style={{ 
        padding: "2rem 3rem",
        textAlign: "center",
        minWidth: "300px"
      }}>
        <LoadingSpinner size="lg" />
        <p style={{ marginTop: "1.5rem", fontWeight: 500 }}>{message}</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ 
  width = "100%", 
  height = "20px",
  className = ""
}: { 
  width?: string; 
  height?: string;
  className?: string;
}) {
  return (
    <div 
      className={`loading-skeleton ${className}`}
      style={{
        width,
        height,
        background: "linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.05) 25%, rgba(var(--color-primary-rgb), 0.1) 50%, rgba(var(--color-primary-rgb), 0.05) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        borderRadius: "4px",
      }}
    />
  );
}

export function TableLoadingSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-panel" style={{ padding: "1.5rem" }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div 
          key={rowIdx} 
          style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "1rem",
            marginBottom: rowIdx < rows - 1 ? "1rem" : 0
          }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <LoadingSkeleton key={colIdx} height="24px" />
          ))}
        </div>
      ))}
    </div>
  );
}
