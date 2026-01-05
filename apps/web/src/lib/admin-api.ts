import { apiFetch } from "./api-client";

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

export async function getDashboardOverview() {
  return apiFetch<DashboardOverviewResponse>("/api/v1/dashboard/overview");
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
