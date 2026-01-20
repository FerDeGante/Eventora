"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EventoraButton } from "../ui/EventoraButton";
import { useEventoraTheme } from "../../providers";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";
import { AccessDenied } from "../AccessDenied";
import { getNavItemsForRole, isRouteAllowed, shouldRedirectOnDenied } from "@/lib/rbac";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useEventoraTheme();
  const auth = useAuth();
  const role = auth.user?.role;
  const navItems = getNavItemsForRole(role);
  const canAccessRoute = isRouteAllowed(pathname, role);
  const shouldRedirect = shouldRedirectOnDenied(role);
  const deniedMessage = searchParams.get("denied") === "1";
  const canCreateReservation = isRouteAllowed("/wizard", role);

  useEffect(() => {
    if (!auth.loading && !auth.token) {
      router.push("/login");
    }
  }, [auth.loading, auth.token, router]);

  useEffect(() => {
    if (!auth.loading && auth.token && !canAccessRoute && shouldRedirect) {
      router.replace("/dashboard?denied=1");
    }
  }, [auth.loading, auth.token, canAccessRoute, shouldRedirect, router]);

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
              onClick={() => {
                if (canCreateReservation) {
                  router.push("/wizard");
                }
              }}
              disabled={!canCreateReservation}
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
        {deniedMessage && (
          <div className="aurora-shell__notice" role="status" aria-live="polite">
            <strong>Acceso restringido.</strong> Te redirigimos al panel permitido para tu rol.
          </div>
        )}
        <main className="aurora-shell__body" role="main" id="main-content">
          {!auth.loading && auth.token && !canAccessRoute && !shouldRedirect ? (
            <AccessDenied />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
