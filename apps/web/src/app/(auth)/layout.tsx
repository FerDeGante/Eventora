import type { ReactNode } from "react";
import "../globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__gradient" />
      <div className="auth-shell__grid" />
      <div className="auth-shell__content">{children}</div>
    </div>
  );
}
