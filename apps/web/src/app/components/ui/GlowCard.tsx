import type { ReactNode } from "react";

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-panel bloom-glow-card ${className}`.trim()}>
      <span className="bloom-glow-card__halo" aria-hidden="true" />
      <div className="bloom-glow-card__content">{children}</div>
    </div>
  );
}
