"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { EventoraButton } from "../ui/EventoraButton";
import { useEventoraTheme } from "../../providers";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";

const navItems = [
  { label: "Panel", href: "/dashboard" },
  { label: "Clientes", href: "/clients" },
  { label: "Calendario", href: "/calendar" },
  { label: "Reportes", href: "/reports" },
  { label: "Wizard de reserva", href: "/wizard" },
  { label: "Notificaciones", href: "/notifications" },
  { label: "POS", href: "/pos" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Configuración", href: "/settings" },
];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useEventoraTheme();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.token) {
      router.push("/login");
    }
  }, [auth.loading, auth.token, router]);

  return (
    <div className="aurora-shell">
      <aside className="aurora-shell__sidebar glass-panel" role="navigation" aria-label="Navegación principal">
        <div className="aurora-shell__brand">
          <Link 
            href="/" 
            className="aurora-shell__logo"
            aria-label="Ir a página principal de Eventora"
          >
            Eventora
          </Link>
          <p aria-label="Motor clínico">Motor clínico</p>
        </div>
        <nav className="aurora-shell__nav">
          {navItems.map((item) => (
            <button
              key={item.href}
              className={`aurora-shell__nav-item ${pathname.startsWith(item.href) ? "is-active" : ""}`}
              onClick={() => router.push(item.href)}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              aria-label={`Ir a ${item.label}`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="aurora-shell__sidebar-footer">
          <p className="aurora-shell__sidebar-copy">Modo {theme === "dark" ? "Aurora" : "Nebula"}</p>
          <button 
            className="aurora-shell__theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${theme === "dark" ? "Nebula" : "Aurora"}`}
          >
            Alternar tema
          </button>
        </div>
      </aside>
      <div className="aurora-shell__main">
        <header className="aurora-shell__topbar glass-panel" role="banner">
          <div>
            <p className="aurora-shell__eyebrow">Eventora Command Center</p>
            <h1>Operaciones de clínicas</h1>
          </div>
          <div className="aurora-shell__topbar-actions">
            <p className="aurora-shell__user" aria-label="Usuario actual">
              {auth.user?.name ?? "Eventora Admin"}
              <span>{auth.user?.email ?? "admin@eventora.com"}</span>
            </p>
            <EventoraButton 
              onClick={() => router.push("/wizard")}
              aria-label="Crear nueva reserva"
            >
              Nueva reserva
            </EventoraButton>
            <EventoraButton 
              variant="ghost" 
              onClick={() => { auth.clearSession(); router.push("/login"); }}
              aria-label="Cerrar sesión y salir del sistema"
            >
              Cerrar sesión
            </EventoraButton>
          </div>
        </header>
        <main className="aurora-shell__body" role="main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
