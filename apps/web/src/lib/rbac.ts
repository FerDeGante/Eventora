export const ROLES = ["ADMIN", "MANAGER", "RECEPTION", "THERAPIST", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];

type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

type RouteRule = {
  path: string;
  roles: Role[];
};

const ALL_ROLES: Role[] = [...ROLES];

export const NAV_ITEMS: NavItem[] = [
  { label: "Panel", href: "/dashboard", roles: ALL_ROLES },
  { label: "Clientes", href: "/clients", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { label: "Calendario", href: "/calendar", roles: ["ADMIN", "MANAGER", "RECEPTION", "THERAPIST"] },
  { label: "Reportes", href: "/reports", roles: ["ADMIN", "MANAGER"] },
  { label: "Wizard de reserva", href: "/wizard", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { label: "Notificaciones", href: "/notifications", roles: ["ADMIN", "MANAGER"] },
  { label: "POS", href: "/pos", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { label: "Marketplace", href: "/marketplace", roles: ["ADMIN", "MANAGER"] },
  { label: "Configuración", href: "/settings", roles: ["ADMIN", "MANAGER"] },
];

export const ROUTE_RULES: RouteRule[] = [
  { path: "/dashboard", roles: ALL_ROLES },
  { path: "/clients", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { path: "/calendar", roles: ["ADMIN", "MANAGER", "RECEPTION", "THERAPIST"] },
  { path: "/reports", roles: ["ADMIN", "MANAGER"] },
  { path: "/wizard", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { path: "/notifications", roles: ["ADMIN", "MANAGER"] },
  { path: "/pos", roles: ["ADMIN", "MANAGER", "RECEPTION"] },
  { path: "/marketplace", roles: ["ADMIN", "MANAGER"] },
  { path: "/settings", roles: ["ADMIN", "MANAGER"] },
];

export const REDIRECT_ON_DENY_ROLES: Role[] = ["CLIENT"];

export const getNavItemsForRole = (role?: Role) => {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
};

export const getRouteRuleForPath = (pathname: string) =>
  ROUTE_RULES.find((rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`));

export const isRouteAllowed = (pathname: string, role?: Role) => {
  const rule = getRouteRuleForPath(pathname);
  if (!rule) return true;
  if (!role) return false;
  return rule.roles.includes(role);
};

export const shouldRedirectOnDenied = (role?: Role) => {
  if (!role) return false;
  return REDIRECT_ON_DENY_ROLES.includes(role);
};
