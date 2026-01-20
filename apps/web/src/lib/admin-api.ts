import { apiFetch } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type DashboardStat = { label: string; value: string; delta?: string };
export type DashboardTimelineItem = {
  id: string;
  time?: string;
  startAt?: string;
  patient: string;
  service: string;
  therapist?: string;
  branch?: string;
  status: "scheduled" | "checked_in" | "completed";
};

export type DashboardWebhook = { provider: string; status: string; lastEvent: string };
export type DashboardNotification = { template: string; channel: string; status: string; schedule?: string };
export type DashboardPosTicket = { id: string; branch: string; branchId?: string; total: string; status: string };
export type NotificationTemplate = {
  id: string;
  key?: string;
  name: string;
  description?: string;
  channels?: string[];
  status?: "active" | "paused" | "draft";
  schedule?: string;
  triggers?: string[];
  lastSentAt?: string;
  subject?: string;
  html?: string | null;
  text?: string | null;
};

export type DashboardOverviewResponse = {
  stats: DashboardStat[];
  timeline: DashboardTimelineItem[];
  webhooks: DashboardWebhook[];
  notifications: DashboardNotification[];
  posQueue: DashboardPosTicket[];
  fallback?: boolean;
};

export type ReservationsAnalyticsPoint = {
  date: string;
  reservations: number;
  completed: number;
  cancelled: number;
};

export type RevenueAnalyticsPoint = {
  period: string;
  stripe: number;
  pos: number;
  cash: number;
};

export async function getDashboardOverview() {
  return apiFetch<DashboardOverviewResponse>("/api/v1/dashboard/overview");
}

export async function getReservationsAnalytics(params?: { start?: string; end?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.start) searchParams.set("start", params.start);
  if (params?.end) searchParams.set("end", params.end);
  const query = searchParams.toString();
  return apiFetch<ReservationsAnalyticsPoint[]>(`/api/v1/analytics/reservations${query ? `?${query}` : ""}`);
}

export async function getRevenueAnalytics(params?: { start?: string; end?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.start) searchParams.set("start", params.start);
  if (params?.end) searchParams.set("end", params.end);
  const query = searchParams.toString();
  return apiFetch<RevenueAnalyticsPoint[]>(`/api/v1/analytics/revenue${query ? `?${query}` : ""}`);
}

export async function getPosTickets() {
  return apiFetch<DashboardPosTicket[]>("/api/v1/pos/tickets");
}

export async function triggerPosPrint(ticketId: string) {
  return apiFetch(`/api/v1/pos/tickets/${ticketId}/print`, { method: "POST" });
}

export async function triggerPosDemoPrint() {
  return apiFetch("/api/v1/pos/tickets/print-demo", { method: "POST" });
}

export async function closePosShift(branchId: string) {
  return apiFetch(`/api/v1/pos/branches/${branchId}/close-shift`, { method: "POST" });
}

export async function getNotificationTemplates() {
  return apiFetch<NotificationTemplate[]>("/api/v1/notifications/templates");
}

export async function updateNotificationTemplate(id: string, payload: Partial<NotificationTemplate>) {
  return apiFetch<NotificationTemplate>(`/api/v1/notifications/templates/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export type CreateClinicPayload = { name: string; slug: string; ownerUserEmail?: string };
export async function createClinic(payload: CreateClinicPayload) {
  return apiFetch<{ id: string; name: string; slug: string }>("/api/v1/clinics", {
    method: "POST",
    json: payload,
  });
}

export type InviteStaffPayload = {
  email: string;
  name?: string;
  role?: "ADMIN" | "MANAGER" | "RECEPTION" | "THERAPIST" | "CLIENT";
  branchId?: string;
  phone?: string;
};

export async function inviteStaff(payload: InviteStaffPayload) {
  return apiFetch(`/api/v1/users`, {
    method: "POST",
    json: { ...payload, password: "Eventora123!" },
  });
}

// Checkout / Payments
export type CheckoutPayload = {
  userId: string;
  mode: "package" | "reservation";
  amount?: number;
  currency?: string;
  reservationId?: string;
  packageId?: string;
  successUrl: string;
  cancelUrl: string;
  provider?: "stripe" | "mercadopago" | "cash" | "terminal";
  clinicId?: string;
  priceId?: string;
};

export type CheckoutResponse = {
  sessionId?: string;
  url?: string;
  paymentId?: string;
};

export async function createCheckout(payload: CheckoutPayload) {
  return apiFetch<CheckoutResponse>("/api/v1/payments/checkout", {
    method: "POST",
    json: payload,
  });
}

// ============================================
// CLIENTS / USERS
// ============================================
export type Client = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export type ListClientsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  hasMembership?: "true" | "false";
};

export async function getClients(params?: ListClientsParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.hasMembership) searchParams.set("hasMembership", params.hasMembership);
  
  const query = searchParams.toString();
  return apiFetch<Client[]>(`/api/v1/users${query ? `?${query}` : ""}`);
}

export async function exportClientsCSV(params?: ListClientsParams) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.hasMembership) searchParams.set("hasMembership", params.hasMembership);
  searchParams.set("role", "CLIENT");
  
  const query = searchParams.toString();
  const response = await fetch(`${API_URL}/api/v1/users/export/csv?${query}`, {
    credentials: "include",
  });
  
  if (!response.ok) throw new Error("Error exporting CSV");
  return response.blob();
}

export async function getClient(id: string) {
  return apiFetch<Client>(`/api/v1/users/${id}`);
}

export type CreateClientPayload = {
  email: string;
  name: string;
  phone?: string;
  password?: string;
  role?: string;
};

export async function createClient(payload: CreateClientPayload) {
  return apiFetch<Client>("/api/v1/users", {
    method: "POST",
    json: { ...payload, password: payload.password || "Eventora123!", role: payload.role || "CLIENT" },
  });
}

export async function updateClient(id: string, payload: Partial<CreateClientPayload>) {
  return apiFetch<Client>(`/api/v1/users/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteClient(id: string) {
  return apiFetch(`/api/v1/users/${id}`, { method: "DELETE" });
}

// ============================================
// RESERVATIONS / CALENDAR
// ============================================
export type Reservation = {
  id: string;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  user?: { id: string; name: string; email: string };
  service?: { id: string; name: string; duration: number; price: number };
  therapist?: { id: string; name: string };
  branch?: { id: string; name: string };
  createdAt: string;
};

export type ListReservationsParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
  therapistId?: string;
  branchId?: string;
  page?: number;
  pageSize?: number;
};

export async function getReservations(params?: ListReservationsParams) {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.therapistId) searchParams.set("therapistId", params.therapistId);
  if (params?.branchId) searchParams.set("branchId", params.branchId);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  
  const query = searchParams.toString();
  return apiFetch<Reservation[]>(`/api/v1/reservations${query ? `?${query}` : ""}`);
}

export async function getReservation(id: string) {
  return apiFetch<Reservation>(`/api/v1/reservations/${id}`);
}

export async function updateReservationStatus(id: string, status: string) {
  return apiFetch<Reservation>(`/api/v1/reservations/${id}/status`, {
    method: "PATCH",
    json: { status },
  });
}

export type CreateReservationInput = {
  serviceId: string;
  branchId: string;
  startAt: string;
  therapistId?: string;
  notes?: string;
  // Existing user
  userId?: string;
  // Or quick create with new client
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
};

export async function createReservation(input: CreateReservationInput) {
  return apiFetch<Reservation>("/api/v1/reservations", {
    method: "POST",
    json: input,
  });
}

// ============================================
// THERAPISTS
// ============================================
export type Therapist = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  branchId?: string;
};

export async function getTherapists() {
  return apiFetch<Therapist[]>("/api/v1/users?role=THERAPIST");
}

// ============================================
// CLINIC SETTINGS
// ============================================
export type ClinicSettings = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  timezone: string | null;
  currency: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  settings: Record<string, unknown> | null;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateClinicPayload = {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  timezone?: string;
  currency?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string | null;
  description?: string;
  settings?: Record<string, unknown>;
};

export async function getClinicSettings() {
  return apiFetch<ClinicSettings>("/api/v1/clinics/me");
}

export async function updateClinicSettings(payload: UpdateClinicPayload) {
  return apiFetch<ClinicSettings>("/api/v1/clinics/me", {
    method: "PATCH",
    json: payload,
  });
}

// ============================================
// BRANCHES
// ============================================
export type Branch = {
  id: string;
  name: string;
  address: string | null;
  timezone: string | null;
  phone: string | null;
};

export async function getBranches() {
  return apiFetch<Branch[]>("/api/v1/clinics/me/branches");
}

// ============================================
// SERVICES
// ============================================
export type ServiceCategory = {
  id: string;
  name: string;
  colorHex: string | null;
  sortOrder: number;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: number;
  categoryId: string | null;
  isPackageable: boolean;
  capacity?: number | null; // For group services (classes)
  category?: { name: string; colorHex: string | null };
};

export type CreateServicePayload = {
  name: string;
  description?: string;
  defaultDuration: number;
  basePrice: number;
  categoryId?: string;
  isPackageable?: boolean;
  capacity?: number | null; // For group services (classes)
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

export async function getServices() {
  return apiFetch<Service[]>("/api/v1/catalog/services");
}

export async function createService(payload: CreateServicePayload) {
  return apiFetch<Service>("/api/v1/catalog/services", {
    method: "POST",
    json: payload,
  });
}

export async function updateService(id: string, payload: UpdateServicePayload) {
  return apiFetch<Service>(`/api/v1/catalog/services/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteService(id: string) {
  return apiFetch<{ success: boolean }>(`/api/v1/catalog/services/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// SERVICE CATEGORIES
// ============================================
export type CreateCategoryPayload = {
  name: string;
  colorHex?: string;
  sortOrder?: number;
};

export async function getServiceCategories() {
  return apiFetch<ServiceCategory[]>("/api/v1/catalog/categories");
}

export async function createServiceCategory(payload: CreateCategoryPayload) {
  return apiFetch<ServiceCategory>("/api/v1/catalog/categories", {
    method: "POST",
    json: payload,
  });
}

export async function updateServiceCategory(id: string, payload: Partial<CreateCategoryPayload>) {
  return apiFetch<ServiceCategory>(`/api/v1/catalog/categories/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteServiceCategory(id: string) {
  return apiFetch<{ success: boolean }>(`/api/v1/catalog/categories/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// MEMBERSHIPS
// ============================================
export type MembershipType = "UNLIMITED" | "SESSIONS_TOTAL" | "SESSIONS_PERIOD" | "TIME_BASED";
export type BillingCycle = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export type Membership = {
  id: string;
  name: string;
  description: string | null;
  type: MembershipType;
  price: number;
  billingCycle: BillingCycle;
  inscriptionFee: number;
  sessionsTotal: number | null;
  sessionsPerPeriod: number | null;
  periodType: BillingCycle | null;
  durationDays: number | null;
  allowedServices: string[];
  allowedBranches: string[];
  maxFreezeDays: number;
  gracePeriodDays: number;
  isPublic: boolean;
  sortOrder: number;
  stripePriceId: string | null;
  stripeProductId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { userMemberships: number };
};

export type CreateMembershipPayload = {
  name: string;
  description?: string;
  type?: MembershipType;
  price?: number;
  billingCycle?: BillingCycle;
  inscriptionFee?: number;
  sessionsTotal?: number;
  sessionsPerPeriod?: number;
  periodType?: BillingCycle;
  durationDays?: number;
  allowedServices?: string[];
  allowedBranches?: string[];
  maxFreezeDays?: number;
  gracePeriodDays?: number;
  isPublic?: boolean;
  sortOrder?: number;
  stripePriceId?: string;
  stripeProductId?: string;
};

export type MembershipsResponse = {
  memberships: Membership[];
  total: number;
  limit: number;
  offset: number;
};

export async function getMemberships(params?: { type?: string; isPublic?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.isPublic !== undefined) searchParams.set("isPublic", String(params.isPublic));
  const query = searchParams.toString();
  return apiFetch<MembershipsResponse>(`/api/v1/memberships${query ? `?${query}` : ""}`);
}

export async function getMembership(id: string) {
  return apiFetch<Membership>(`/api/v1/memberships/${id}`);
}

export async function createMembership(payload: CreateMembershipPayload) {
  return apiFetch<Membership>("/api/v1/memberships", {
    method: "POST",
    json: payload,
  });
}

export async function updateMembership(id: string, payload: Partial<CreateMembershipPayload>) {
  return apiFetch<Membership>(`/api/v1/memberships/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteMembership(id: string) {
  return apiFetch(`/api/v1/memberships/${id}`, { method: "DELETE" });
}

// User Memberships (Subscriptions)
export type UserMembership = {
  id: string;
  userId: string;
  membershipId: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string | null;
  sessionsUsed: number;
  sessionsRemaining: number | null;
  pricePaid: number;
  autoRenew: boolean;
  membership: { name: string; type: MembershipType; price: number };
  user: { name: string | null; email: string };
  _count?: { checkIns: number };
};

export type UserMembershipsResponse = {
  userMemberships: UserMembership[];
  total: number;
  limit: number;
  offset: number;
};

export async function getUserMemberships(params?: { userId?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.set("userId", params.userId);
  if (params?.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return apiFetch<UserMembershipsResponse>(`/api/v1/memberships/subscriptions${query ? `?${query}` : ""}`);
}

export async function createUserMembership(payload: {
  userId: string;
  membershipId: string;
  pricePaid?: number;
  autoRenew?: boolean;
}) {
  return apiFetch<UserMembership>("/api/v1/memberships/subscriptions", {
    method: "POST",
    json: payload,
  });
}

export async function updateUserMembership(id: string, payload: {
  status?: "ACTIVE" | "PAUSED" | "CANCELLED";
  autoRenew?: boolean;
}) {
  return apiFetch<UserMembership>(`/api/v1/memberships/subscriptions/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

// ============================================
// STRIPE CONNECT
// ============================================
export type ConnectStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId?: string;
  detailsSubmitted?: boolean;
  requirementsDue?: string[];
  disabledReason?: string | null;
};

export type ConnectOnboardingResponse = {
  accountId: string;
  onboardingUrl: string;
  expiresAt: string;
};

export async function getConnectStatus() {
  return apiFetch<ConnectStatus>("/api/v1/stripe/connect/status");
}

export async function startConnectOnboarding(refreshUrl: string, returnUrl: string) {
  return apiFetch<ConnectOnboardingResponse>("/api/v1/stripe/connect/onboarding", {
    method: "POST",
    json: { refreshUrl, returnUrl },
  });
}

export async function getStripeDashboardLink() {
  return apiFetch<{ url: string }>("/api/v1/stripe/connect/dashboard-link", {
    method: "POST",
  });
}

export type StripeWebhookEvent = {
  id: string;
  type: string;
  createdAt: string;
  status?: string;
};

export type StripeWebhookHealth = {
  status: "healthy" | "degraded" | "missing" | "unknown";
  lastEventAt?: string;
  lastEventType?: string;
  events?: StripeWebhookEvent[];
};

export async function getStripeWebhookHealth() {
  return apiFetch<StripeWebhookHealth>("/api/v1/stripe/webhooks/health");
}

// ============================================
// REPORTS
// ============================================
export type ReportSummary = {
  revenue: { current: number; previous: number; change: number };
  bookings: { current: number; previous: number; change: number };
  activeClients: number;
  activeMemberships: number;
  range: { startDate: string; endDate: string };
};

export type TopService = {
  serviceId: string;
  serviceName: string;
  price: number;
  bookings: number;
  revenue: number;
};

export type OccupancyStats = {
  branchId: string;
  branchName: string;
  reservations: number;
};

export async function getReportSummary(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const query = params.toString();
  return apiFetch<ReportSummary>(`/api/v1/reports/summary${query ? `?${query}` : ""}`);
}

export async function getTopServices(start?: string, end?: string, limit = 10) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  params.set("limit", String(limit));
  return apiFetch<TopService[]>(`/api/v1/reports/top-services?${params.toString()}`);
}

export async function getOccupancyReport(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const query = params.toString();
  return apiFetch<OccupancyStats[]>(`/api/v1/reports/occupancy${query ? `?${query}` : ""}`);
}
