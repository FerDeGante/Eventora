import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de autenticación para Eventora
 * 
 * El token JWT se almacena en localStorage (client-side), por lo que
 * la validación completa ocurre en el cliente (AppChrome).
 * 
 * Este middleware protege rutas básicas y añade headers de seguridad.
 * Para validación server-side completa, considera migrar a cookies httpOnly.
 */

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  "/dashboard",
  "/clients",
  "/calendar",
  "/wizard",
  "/notifications",
  "/pos",
  "/marketplace",
  "/settings",
  "/admin",
];

// Rutas públicas
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/",
  "/book",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files, API routes, and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verificar si el usuario tiene un token en cookies
  // (para compatibilidad futura con auth server-side)
  const authToken = request.cookies.get("eventora-auth-token")?.value;
  
  // Comprobar si es una ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Comprobar si es una ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si hay token y el usuario intenta acceder a login/register, redirigir a dashboard
  if (authToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Crear respuesta base
  const response = NextResponse.next();
  
  // Añadir headers de seguridad
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.eventora.com.mx https://api.stripe.com wss:",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
