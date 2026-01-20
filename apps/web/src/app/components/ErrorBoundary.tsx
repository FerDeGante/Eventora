"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback glass-panel" style={{ 
          padding: "2rem", 
          margin: "2rem auto", 
          maxWidth: "600px",
          textAlign: "center" 
        }}>
          <div className="error-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ marginBottom: "1rem" }}>Algo salió mal</h2>
          <p style={{ 
            color: "var(--color-text-secondary)", 
            marginBottom: "2rem",
            fontSize: "0.95rem"
          }}>
            {this.state.error?.message || "Ha ocurrido un error inesperado"}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button 
              className="bloom-button" 
              onClick={this.handleReset}
              style={{ padding: "0.75rem 2rem" }}
            >
              Intentar de nuevo
            </button>
            <button 
              className="bloom-button" 
              onClick={() => window.location.href = "/dashboard"}
              style={{ 
                padding: "0.75rem 2rem",
                background: "transparent",
                border: "1px solid var(--bloom-border)"
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
